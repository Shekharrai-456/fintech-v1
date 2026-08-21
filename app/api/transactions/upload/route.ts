import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { Transaction, CategoryType, CSVUploadResult } from '@/types';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

// Merchant rule categorization mapping
const MERCHANT_RULES: { keywords: string[]; category: CategoryType }[] = [
  {
    keywords: ['bhatbhateni', 'big mart', 'bigmart', 'salesberry', 'grocery', 'mart', 'supermarket', 'fresh', 'vegetable'],
    category: 'Food & Groceries',
  },
  {
    keywords: ['foodmandu', 'momo', 'pizza', 'bakery', 'restaurant', 'cafe', 'dining', 'kitchen', 'hotel', 'hyatt'],
    category: 'Food & Groceries',
  },
  {
    keywords: ['pathao', 'indrive', 'petrol', 'diesel', 'fuel', 'oil corp', 'nepal oil', 'transport', 'airline', 'yeti', 'buddha'],
    category: 'Transportation',
  },
  {
    keywords: ['worldlink', 'vianet', 'ncell', 'ntc', 'nepal telecom', 'nea', 'electricity', 'khanepani', 'utility', 'water'],
    category: 'Utilities',
  },
  {
    keywords: ['daraz', 'clothing', 'shoes', 'shopping', 'fashion', 'store', 'apparel', 'jewel'],
    category: 'Shopping',
  },
  {
    keywords: ['school', 'college', 'university', 'tuition', 'academy', 'education', 'books', 'stationery'],
    category: 'Education',
  },
  {
    keywords: ['hospital', 'clinic', 'pharmacy', 'medicine', 'medical', 'norvic', 'teaching', 'lab'],
    category: 'Healthcare',
  },
  {
    keywords: ['netflix', 'cinema', 'movie', 'hotstar', 'ticket', 'club', 'bar', 'qfx', 'resort'],
    category: 'Entertainment',
  },
  {
    keywords: ['rent', 'landlord', 'housing', 'apartment', 'flat'],
    category: 'Housing',
  },
  {
    keywords: ['salary', 'stipend', 'payroll', 'remittance', 'bonus', 'wage', 'commission'],
    category: 'Salary',
  },
  {
    keywords: ['sip', 'mutual fund', 'capital', 'stock', 'share', 'investment', 'nabil mutual', 'global ime capital', 'nic asia capital'],
    category: 'Investment',
  },
];

function autoCategorize(description: string, defaultType: 'income' | 'expense'): CategoryType {
  const descLower = description.toLowerCase();

  for (const rule of MERCHANT_RULES) {
    if (rule.keywords.some((kw) => descLower.includes(kw))) {
      return rule.category;
    }
  }

  if (defaultType === 'income') {
    return 'Salary';
  }

  return 'Other';
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId = 'user_shekhar_1';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.split(' ')[1]);
      if (payload) userId = payload.userId;
    }

    const family = db.getFamilyByUserId(userId);
    if (!family) {
      return NextResponse.json({ error: 'Family not found.' }, { status: 404 });
    }

    const body = await req.json();
    const { memberId, accountName, csvContent, memberName } = body;

    if (!csvContent || !memberId) {
      return NextResponse.json(
        { error: 'CSV content and family member ID are required.' },
        { status: 400 }
      );
    }

    // Parse CSV with PapaParse
    const parsed = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/[\s_]+/g, '_'),
    });

    if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid CSV format or empty file.' },
        { status: 400 }
      );
    }

    const existingTxs = db.getTransactionsByFamily(family.id);
    const existingKeys = new Set(
      existingTxs.map((t) => `${t.family_member_id}_${t.date}_${t.amount}_${t.description.toLowerCase().trim()}`)
    );

    const newTransactions: Transaction[] = [];
    let importedCount = 0;
    let duplicateCount = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    let unusualCount = 0;

    for (const row of parsed.data) {
      // Flexible column extraction
      const dateStr = row.date || row.transaction_date || row.txn_date || new Date().toISOString().split('T')[0];
      const desc = row.description || row.details || row.narration || row.particulars || 'Bank Transaction';

      let amount = 0;
      let type: 'income' | 'expense' = 'expense';

      if (row.amount !== undefined && row.amount !== '') {
        const rawAmt = parseFloat(row.amount.replace(/,/g, ''));
        amount = Math.abs(rawAmt);
        if (row.type) {
          type = row.type.toLowerCase().includes('in') || row.type.toLowerCase().includes('cr') ? 'income' : 'expense';
        } else {
          type = rawAmt >= 0 ? 'income' : 'expense';
        }
      } else if (row.credit || row.deposit) {
        const crAmt = parseFloat((row.credit || row.deposit || '0').replace(/,/g, ''));
        if (crAmt > 0) {
          amount = crAmt;
          type = 'income';
        }
      } else if (row.debit || row.withdrawal) {
        const drAmt = parseFloat((row.debit || row.withdrawal || '0').replace(/,/g, ''));
        if (drAmt > 0) {
          amount = drAmt;
          type = 'expense';
        }
      }

      if (amount === 0) continue;

      const dupKey = `${memberId}_${dateStr}_${amount}_${desc.toLowerCase().trim()}`;
      if (existingKeys.has(dupKey)) {
        duplicateCount++;
        continue;
      }

      existingKeys.add(dupKey);

      const category = autoCategorize(desc, type);

      // Basic Anomaly Detection
      let isUnusual = false;
      let unusualReason = undefined;

      if (type === 'expense') {
        if (category === 'Food & Groceries' && amount > 25000) {
          isUnusual = true;
          unusualReason = `High value dining/grocery transaction of Rs. ${amount.toLocaleString()} is significantly above normal range.`;
        } else if (amount > 50000) {
          isUnusual = true;
          unusualReason = `Large transaction of Rs. ${amount.toLocaleString()} detected.`;
        }
      }

      if (isUnusual) unusualCount++;

      if (type === 'income') totalIncome += amount;
      if (type === 'expense') totalExpenses += amount;

      const tx: Transaction = {
        id: `tx_${uuidv4().substring(0, 8)}`,
        family_id: family.id,
        family_member_id: memberId,
        account_name: accountName || 'Primary Account',
        date: dateStr,
        description: desc,
        amount,
        type,
        category,
        merchant: desc.split(' ')[0],
        is_unusual: isUnusual,
        unusual_reason: unusualReason,
        confidence: 0.95,
        created_at: new Date().toISOString(),
      };

      newTransactions.push(tx);
      importedCount++;
    }

    if (newTransactions.length > 0) {
      db.addBulkTransactions(newTransactions);
    }

    const result: CSVUploadResult = {
      transactions_imported: importedCount,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      duplicates_skipped: duplicateCount,
      unusual_detected: unusualCount,
      member_name: memberName || 'Family Member',
    };

    return NextResponse.json({
      message: `CSV processing complete for ${result.member_name}`,
      result,
    });
  } catch (error) {
    console.error('CSV Upload Error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV file.' },
      { status: 500 }
    );
  }
}
