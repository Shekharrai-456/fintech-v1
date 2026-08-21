import fs from 'fs';
import path from 'path';
import { 
  User, 
  Family, 
  FamilyMember, 
  Account, 
  Transaction, 
  Budget, 
  SIP, 
  Goal, 
  MutualFund, 
  AIInsight 
} from '@/types';
import { hashPassword } from '@/lib/auth';

const DB_FILE = path.join(process.cwd(), '.data', 'database.json');

interface DatabaseSchema {
  users: User[];
  families: Family[];
  family_members: FamilyMember[];
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  sips: SIP[];
  goals: Goal[];
  mutual_funds: MutualFund[];
  ai_insights: AIInsight[];
}

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
}

function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDB = seedData();
      writeDB(initialDB);
      return initialDB;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file, returning seed data:', error);
    const initialDB = seedData();
    writeDB(initialDB);
    return initialDB;
  }
}

function writeDB(data: DatabaseSchema): void {
  try {
    ensureDirectoryExists(DB_FILE);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}

export function seedData(): DatabaseSchema {
  const defaultPasswordHash = hashPassword('family123');

  // User
  const defaultUser: User = {
    id: 'user_shekhar_1',
    name: 'Shekhar Rai',
    email: 'shekhar.rai456@gmail.com',
    password_hash: defaultPasswordHash,
    created_at: new Date('2026-01-01').toISOString(),
  };

  // Family
  const defaultFamily: Family = {
    id: 'family_rai_1',
    name: 'Rai Family',
    created_at: new Date('2026-01-01').toISOString(),
  };

  // Members
  const father: FamilyMember = {
    id: 'mem_father',
    family_id: defaultFamily.id,
    name: 'Ram Rai (Father)',
    relation: 'Father',
    monthly_income_target: 120000,
    avatar_url: 'https://picsum.photos/seed/father_rai/150/150',
    created_at: new Date('2026-01-01').toISOString(),
  };

  const mother: FamilyMember = {
    id: 'mem_mother',
    family_id: defaultFamily.id,
    name: 'Sita Rai (Mother)',
    relation: 'Mother',
    monthly_income_target: 75000,
    avatar_url: 'https://picsum.photos/seed/mother_rai/150/150',
    created_at: new Date('2026-01-01').toISOString(),
  };

  const shekhar: FamilyMember = {
    id: 'mem_shekhar',
    family_id: defaultFamily.id,
    user_id: defaultUser.id,
    name: 'Shekhar Rai',
    relation: 'Son',
    monthly_income_target: 40000,
    avatar_url: 'https://picsum.photos/seed/shekhar_rai/150/150',
    created_at: new Date('2026-01-01').toISOString(),
  };

  const sister: FamilyMember = {
    id: 'mem_sister',
    family_id: defaultFamily.id,
    name: 'Suman Rai (Sister)',
    relation: 'Sister',
    monthly_income_target: 0,
    avatar_url: 'https://picsum.photos/seed/sister_rai/150/150',
    created_at: new Date('2026-01-01').toISOString(),
  };

  const members = [father, mother, shekhar, sister];

  // Accounts
  const accounts: Account[] = [
    {
      id: 'acc_nabil_father',
      family_member_id: father.id,
      bank_name: 'Nabil Bank',
      account_number: 'NBL-001928341',
      balance: 245000,
      currency: 'NPR',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_global_mother',
      family_member_id: mother.id,
      bank_name: 'Global IME Bank',
      account_number: 'GIME-992100234',
      balance: 135000,
      currency: 'NPR',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_nic_shekhar',
      family_member_id: shekhar.id,
      bank_name: 'NIC Asia Bank',
      account_number: 'NICA-882190112',
      balance: 62000,
      currency: 'NPR',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_prabhu_sister',
      family_member_id: sister.id,
      bank_name: 'Prabhu Bank',
      account_number: 'PRB-554109281',
      balance: 15000,
      currency: 'NPR',
      updated_at: new Date().toISOString(),
    },
  ];

  // Demo Transactions (NPR)
  const transactions: Transaction[] = [
    // Income
    {
      id: 'tx_1',
      family_id: defaultFamily.id,
      family_member_id: father.id,
      account_name: 'Nabil Bank',
      date: '2026-08-01',
      description: 'Monthly Salary Credit - Civil Hydro Corp',
      amount: 120000,
      type: 'income',
      category: 'Salary',
      merchant: 'Civil Hydro',
      created_at: new Date('2026-08-01').toISOString(),
    },
    {
      id: 'tx_2',
      family_id: defaultFamily.id,
      family_member_id: mother.id,
      account_name: 'Global IME Bank',
      date: '2026-08-02',
      description: 'School Teacher Salary - Green Hill Academy',
      amount: 75000,
      type: 'income',
      category: 'Salary',
      merchant: 'Green Hill Academy',
      created_at: new Date('2026-08-02').toISOString(),
    },
    {
      id: 'tx_3',
      family_id: defaultFamily.id,
      family_member_id: shekhar.id,
      account_name: 'NIC Asia Bank',
      date: '2026-08-03',
      description: 'Freelance Software Development Stipend',
      amount: 40000,
      type: 'income',
      category: 'Salary',
      merchant: 'TechLabs Nepal',
      created_at: new Date('2026-08-03').toISOString(),
    },

    // Expenses - Food & Groceries
    {
      id: 'tx_4',
      family_id: defaultFamily.id,
      family_member_id: father.id,
      account_name: 'Nabil Bank',
      date: '2026-08-04',
      description: 'Bhatbhateni Supermarket Naxal Grocery',
      amount: 18500,
      type: 'expense',
      category: 'Food & Groceries',
      merchant: 'Bhatbhateni',
      created_at: new Date('2026-08-04').toISOString(),
    },
    {
      id: 'tx_5',
      family_id: defaultFamily.id,
      family_member_id: mother.id,
      account_name: 'Global IME Bank',
      date: '2026-08-06',
      description: 'Big Mart Kupondole Fresh Mart',
      amount: 6200,
      type: 'expense',
      category: 'Food & Groceries',
      merchant: 'Big Mart',
      created_at: new Date('2026-08-06').toISOString(),
    },
    {
      id: 'tx_6',
      family_id: defaultFamily.id,
      family_member_id: shekhar.id,
      account_name: 'NIC Asia Bank',
      date: '2026-08-08',
      description: 'Foodmandu Restaurant Delivery Pizza & Momos',
      amount: 3800,
      type: 'expense',
      category: 'Food & Groceries',
      merchant: 'Foodmandu',
      created_at: new Date('2026-08-08').toISOString(),
    },

    // Unusual Transaction for Anomaly Detection Demo!
    {
      id: 'tx_7_unusual',
      family_id: defaultFamily.id,
      family_member_id: father.id,
      account_name: 'Nabil Bank',
      date: '2026-08-10',
      description: 'High Value Luxury Dining & Banquet Event',
      amount: 32000,
      type: 'expense',
      category: 'Food & Groceries',
      merchant: 'Grand Hyatt Dining',
      is_unusual: true,
      unusual_reason: 'Transaction of Rs. 32,000 is 6.5x higher than average food expense (Rs. 4,900)',
      created_at: new Date('2026-08-10').toISOString(),
    },

    // Transportation
    {
      id: 'tx_8',
      family_id: defaultFamily.id,
      family_member_id: shekhar.id,
      account_name: 'NIC Asia Bank',
      date: '2026-08-05',
      description: 'Pathao Rides & Bike Fuel Monthly Topup',
      amount: 4500,
      type: 'expense',
      category: 'Transportation',
      merchant: 'Pathao',
      created_at: new Date('2026-08-05').toISOString(),
    },
    {
      id: 'tx_9',
      family_id: defaultFamily.id,
      family_member_id: father.id,
      account_name: 'Nabil Bank',
      date: '2026-08-11',
      description: 'Nepal Oil Corp Petrol Pump Fuel',
      amount: 8000,
      type: 'expense',
      category: 'Transportation',
      merchant: 'Nepal Oil Corporation',
      created_at: new Date('2026-08-11').toISOString(),
    },

    // Utilities
    {
      id: 'tx_10',
      family_id: defaultFamily.id,
      family_member_id: mother.id,
      account_name: 'Global IME Bank',
      date: '2026-08-07',
      description: 'Nepal Electricity Authority (NEA) & Khanepani Bill',
      amount: 4200,
      type: 'expense',
      category: 'Utilities',
      merchant: 'NEA & Khanepani',
      created_at: new Date('2026-08-07').toISOString(),
    },
    {
      id: 'tx_11',
      family_id: defaultFamily.id,
      family_member_id: shekhar.id,
      account_name: 'NIC Asia Bank',
      date: '2026-08-09',
      description: 'WorldLink Internet Fiber Bill & Ncell Data',
      amount: 2800,
      type: 'expense',
      category: 'Utilities',
      merchant: 'WorldLink / Ncell',
      created_at: new Date('2026-08-09').toISOString(),
    },

    // Education
    {
      id: 'tx_12',
      family_id: defaultFamily.id,
      family_member_id: father.id,
      account_name: 'Nabil Bank',
      date: '2026-08-12',
      description: 'College Tuition Fee - Kathmandu University',
      amount: 25000,
      type: 'expense',
      category: 'Education',
      merchant: 'Kathmandu University',
      created_at: new Date('2026-08-12').toISOString(),
    },

    // Healthcare
    {
      id: 'tx_13',
      family_id: defaultFamily.id,
      family_member_id: mother.id,
      account_name: 'Global IME Bank',
      date: '2026-08-14',
      description: 'Norvic International Hospital Checkup & Pharmacy',
      amount: 9500,
      type: 'expense',
      category: 'Healthcare',
      merchant: 'Norvic Hospital',
      created_at: new Date('2026-08-14').toISOString(),
    },

    // Shopping
    {
      id: 'tx_14',
      family_id: defaultFamily.id,
      family_member_id: sister.id,
      account_name: 'Prabhu Bank',
      date: '2026-08-15',
      description: 'Daraz Online Shopping Clothing & Shoes',
      amount: 8600,
      type: 'expense',
      category: 'Shopping',
      merchant: 'Daraz Kaymu',
      created_at: new Date('2026-08-15').toISOString(),
    },

    // Investments / SIP Automatic debits
    {
      id: 'tx_15',
      family_id: defaultFamily.id,
      family_member_id: father.id,
      account_name: 'Nabil Bank',
      date: '2026-08-05',
      description: 'Nabil Balanced Fund SIP Auto-Debit',
      amount: 10000,
      type: 'expense',
      category: 'Investment',
      merchant: 'Nabil Mutual Fund',
      created_at: new Date('2026-08-05').toISOString(),
    },
    {
      id: 'tx_16',
      family_id: defaultFamily.id,
      family_member_id: mother.id,
      account_name: 'Global IME Bank',
      date: '2026-08-05',
      description: 'Global IME Samunnati Scheme SIP Debit',
      amount: 8000,
      type: 'expense',
      category: 'Investment',
      merchant: 'Global IME Capital',
      created_at: new Date('2026-08-05').toISOString(),
    },
    {
      id: 'tx_17',
      family_id: defaultFamily.id,
      family_member_id: shekhar.id,
      account_name: 'NIC Asia Bank',
      date: '2026-08-05',
      description: 'NIC Asia Dynamic Equity Fund SIP Debit',
      amount: 3000,
      type: 'expense',
      category: 'Investment',
      merchant: 'NIC Asia Capital',
      created_at: new Date('2026-08-05').toISOString(),
    },
  ];

  // Budgets
  const budgets: Budget[] = [
    {
      id: 'bgt_1',
      family_id: defaultFamily.id,
      category: 'Food & Groceries',
      monthly_budget: 45000,
      month_year: '2026-08',
      created_at: new Date('2026-08-01').toISOString(),
    },
    {
      id: 'bgt_2',
      family_id: defaultFamily.id,
      category: 'Transportation',
      monthly_budget: 15000,
      month_year: '2026-08',
      created_at: new Date('2026-08-01').toISOString(),
    },
    {
      id: 'bgt_3',
      family_id: defaultFamily.id,
      category: 'Education',
      monthly_budget: 30000,
      month_year: '2026-08',
      created_at: new Date('2026-08-01').toISOString(),
    },
    {
      id: 'bgt_4',
      family_id: defaultFamily.id,
      category: 'Utilities',
      monthly_budget: 10000,
      month_year: '2026-08',
      created_at: new Date('2026-08-01').toISOString(),
    },
    {
      id: 'bgt_5',
      family_id: defaultFamily.id,
      category: 'Shopping',
      monthly_budget: 12000,
      month_year: '2026-08',
      created_at: new Date('2026-08-01').toISOString(),
    },
  ];

  // SIPs
  const sips: SIP[] = [
    {
      id: 'sip_father_nabil',
      family_id: defaultFamily.id,
      family_member_id: father.id,
      fund_name: 'Nabil Balanced Fund (NBF-II)',
      monthly_amount: 10000,
      frequency: 'monthly',
      start_date: '2024-01-01',
      duration_months: 60,
      status: 'active',
      created_at: new Date('2024-01-01').toISOString(),
    },
    {
      id: 'sip_mother_gime',
      family_id: defaultFamily.id,
      family_member_id: mother.id,
      fund_name: 'Global IME Samunnati Scheme',
      monthly_amount: 8000,
      frequency: 'monthly',
      start_date: '2024-06-01',
      duration_months: 36,
      status: 'active',
      created_at: new Date('2024-06-01').toISOString(),
    },
    {
      id: 'sip_shekhar_nica',
      family_id: defaultFamily.id,
      family_member_id: shekhar.id,
      fund_name: 'NIC Asia Dynamic Equity Fund',
      monthly_amount: 3000,
      frequency: 'monthly',
      start_date: '2025-01-01',
      duration_months: 48,
      status: 'active',
      created_at: new Date('2025-01-01').toISOString(),
    },
  ];

  // Financial Goals
  const goals: Goal[] = [
    {
      id: 'goal_education',
      family_id: defaultFamily.id,
      family_member_id: sister.id,
      name: 'Sister Higher Education Fund',
      target_amount: 800000,
      current_amount: 200000,
      target_date: '2028-12-31',
      category: 'Education',
      status: 'in_progress',
      created_at: new Date('2025-01-01').toISOString(),
    },
    {
      id: 'goal_emergency',
      family_id: defaultFamily.id,
      name: 'Family Emergency Safety Reserve',
      target_amount: 500000,
      current_amount: 350000,
      target_date: '2026-12-31',
      category: 'Emergency Fund',
      status: 'in_progress',
      created_at: new Date('2025-01-01').toISOString(),
    },
    {
      id: 'goal_house',
      family_id: defaultFamily.id,
      name: 'Pokhara Vacation Cottage Down Payment',
      target_amount: 2500000,
      current_amount: 600000,
      target_date: '2030-06-30',
      category: 'House',
      status: 'in_progress',
      created_at: new Date('2025-01-01').toISOString(),
    },
  ];

  // Mutual Funds catalog in Nepal
  const mutual_funds: MutualFund[] = [
    {
      id: 'mf_1',
      name: 'Nabil Balanced Fund II',
      category: 'Balanced Fund',
      return_1yr: 14.5,
      return_3yr: 12.8,
      risk_level: 'Moderate',
      min_sip: 1000,
    },
    {
      id: 'mf_2',
      name: 'NIC Asia Dynamic Equity Fund',
      category: 'Equity Oriented',
      return_1yr: 18.2,
      return_3yr: 15.4,
      risk_level: 'High',
      min_sip: 1000,
    },
    {
      id: 'mf_3',
      name: 'Global IME Samunnati Scheme',
      category: 'Equity Oriented',
      return_1yr: 16.0,
      return_3yr: 13.9,
      risk_level: 'High',
      min_sip: 1000,
    },
    {
      id: 'mf_4',
      name: 'Siddhartha Investment Growth Scheme-3',
      category: 'Growth Fund',
      return_1yr: 13.8,
      return_3yr: 11.5,
      risk_level: 'Moderate',
      min_sip: 1000,
    },
    {
      id: 'mf_5',
      name: 'NIBL Samriddhi Fund II',
      category: 'Balanced Fund',
      return_1yr: 12.2,
      return_3yr: 10.9,
      risk_level: 'Low',
      min_sip: 1000,
    },
  ];

  // AI Insights
  const ai_insights: AIInsight[] = [
    {
      id: 'ins_1',
      family_id: defaultFamily.id,
      title: 'Food & Dining Spike Alert',
      content: 'Food & Groceries expense increased by 18% this month due to an unusually large Rs. 32,000 transaction at Grand Hyatt Dining.',
      type: 'warning',
      date: '2026-08-11',
      created_at: new Date().toISOString(),
    },
    {
      id: 'ins_2',
      family_id: defaultFamily.id,
      title: 'Healthy Family Savings Rate',
      content: 'Your Rai Family saved Rs. 66,600 this month, maintaining a strong 28.3% savings rate exceeding your 25% target.',
      type: 'positive',
      date: '2026-08-15',
      created_at: new Date().toISOString(),
    },
    {
      id: 'ins_3',
      family_id: defaultFamily.id,
      title: 'Active Family SIP Commitment',
      content: 'Your family is systematically building wealth with Rs. 21,000/month across Father (Rs. 10k), Mother (Rs. 8k), and Shekhar (Rs. 3k).',
      type: 'tip',
      date: '2026-08-15',
      created_at: new Date().toISOString(),
    },
    {
      id: 'ins_4',
      family_id: defaultFamily.id,
      title: 'Education Goal On Track',
      content: 'Sister Higher Education Fund is 25% complete (Rs. 200,000 / Rs. 800,000). Allocating an extra Rs. 5,000/mo SIP will achieve it 6 months early.',
      type: 'positive',
      date: '2026-08-15',
      created_at: new Date().toISOString(),
    },
  ];

  return {
    users: [defaultUser],
    families: [defaultFamily],
    family_members: members,
    accounts,
    transactions,
    budgets,
    sips,
    goals,
    mutual_funds,
    ai_insights,
  };
}

export const db = {
  getRawData: (): DatabaseSchema => readDB(),
  
  // Users
  getUserByEmail: (email: string): User | undefined => {
    const data = readDB();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  getUserById: (id: string): User | undefined => {
    const data = readDB();
    return data.users.find((u) => u.id === id);
  },
  createUser: (user: User): User => {
    const data = readDB();
    data.users.push(user);
    writeDB(data);
    return user;
  },

  // Families
  getFamily: (id: string): Family | undefined => {
    const data = readDB();
    return data.families.find((f) => f.id === id);
  },
  getFamilyByUserId: (userId: string): Family | undefined => {
    const data = readDB();
    const member = data.family_members.find((m) => m.user_id === userId);
    if (member) {
      return data.families.find((f) => f.id === member.family_id);
    }
    return data.families[0]; // fallback default family
  },
  createFamily: (family: Family): Family => {
    const data = readDB();
    data.families.push(family);
    writeDB(data);
    return family;
  },

  // Family Members
  getFamilyMembers: (familyId: string): FamilyMember[] => {
    const data = readDB();
    return data.family_members.filter((m) => m.family_id === familyId);
  },
  addFamilyMember: (member: FamilyMember): FamilyMember => {
    const data = readDB();
    data.family_members.push(member);
    writeDB(data);
    return member;
  },
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>): FamilyMember | null => {
    const data = readDB();
    const index = data.family_members.findIndex((m) => m.id === id);
    if (index === -1) return null;
    data.family_members[index] = { ...data.family_members[index], ...updates };
    writeDB(data);
    return data.family_members[index];
  },
  deleteFamilyMember: (id: string): boolean => {
    const data = readDB();
    const initialLen = data.family_members.length;
    data.family_members = data.family_members.filter((m) => m.id !== id);
    writeDB(data);
    return data.family_members.length < initialLen;
  },

  // Accounts
  getAccountsByMember: (memberId: string): Account[] => {
    const data = readDB();
    return data.accounts.filter((a) => a.family_member_id === memberId);
  },
  getAccountsByFamily: (familyId: string): Account[] => {
    const data = readDB();
    const members = data.family_members.filter((m) => m.family_id === familyId).map((m) => m.id);
    return data.accounts.filter((a) => members.includes(a.family_member_id));
  },
  addAccount: (account: Account): Account => {
    const data = readDB();
    data.accounts.push(account);
    writeDB(data);
    return account;
  },

  // Transactions
  getTransactionsByFamily: (familyId: string): Transaction[] => {
    const data = readDB();
    return data.transactions.filter((t) => t.family_id === familyId);
  },
  addTransaction: (transaction: Transaction): Transaction => {
    const data = readDB();
    data.transactions.unshift(transaction); // add to top
    writeDB(data);
    return transaction;
  },
  addBulkTransactions: (newTxs: Transaction[]): number => {
    const data = readDB();
    data.transactions = [...newTxs, ...data.transactions];
    writeDB(data);
    return newTxs.length;
  },
  updateTransactionCategory: (id: string, category: Transaction['category']): Transaction | null => {
    const data = readDB();
    const index = data.transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;
    data.transactions[index].category = category;
    writeDB(data);
    return data.transactions[index];
  },

  // Budgets
  getBudgetsByFamily: (familyId: string): Budget[] => {
    const data = readDB();
    return data.budgets.filter((b) => b.family_id === familyId);
  },
  saveBudget: (budget: Budget): Budget => {
    const data = readDB();
    const index = data.budgets.findIndex(
      (b) => b.family_id === budget.family_id && b.category === budget.category
    );
    if (index !== -1) {
      data.budgets[index] = budget;
    } else {
      data.budgets.push(budget);
    }
    writeDB(data);
    return budget;
  },

  // SIPs
  getSIPsByFamily: (familyId: string): SIP[] => {
    const data = readDB();
    return data.sips.filter((s) => s.family_id === familyId);
  },
  addSIP: (sip: SIP): SIP => {
    const data = readDB();
    data.sips.push(sip);
    writeDB(data);
    return sip;
  },
  updateSIPStatus: (id: string, status: SIP['status']): SIP | null => {
    const data = readDB();
    const index = data.sips.findIndex((s) => s.id === id);
    if (index === -1) return null;
    data.sips[index].status = status;
    writeDB(data);
    return data.sips[index];
  },
  deleteSIP: (id: string): boolean => {
    const data = readDB();
    const initialLen = data.sips.length;
    data.sips = data.sips.filter((s) => s.id !== id);
    writeDB(data);
    return data.sips.length < initialLen;
  },

  // Goals
  getGoalsByFamily: (familyId: string): Goal[] => {
    const data = readDB();
    return data.goals.filter((g) => g.family_id === familyId);
  },
  addGoal: (goal: Goal): Goal => {
    const data = readDB();
    data.goals.push(goal);
    writeDB(data);
    return goal;
  },
  updateGoalAmount: (id: string, currentAmount: number): Goal | null => {
    const data = readDB();
    const index = data.goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    data.goals[index].current_amount = currentAmount;
    if (data.goals[index].current_amount >= data.goals[index].target_amount) {
      data.goals[index].status = 'completed';
    }
    writeDB(data);
    return data.goals[index];
  },

  // AI Insights
  getInsightsByFamily: (familyId: string): AIInsight[] => {
    const data = readDB();
    return data.ai_insights.filter((i) => i.family_id === familyId);
  },
  addInsight: (insight: AIInsight): AIInsight => {
    const data = readDB();
    data.ai_insights.unshift(insight);
    writeDB(data);
    return insight;
  },

  // Mutual Funds
  getMutualFunds: (): MutualFund[] => {
    const data = readDB();
    return data.mutual_funds;
  },

  // Reset database
  resetDatabase: (): DatabaseSchema => {
    const freshData = seedData();
    writeDB(freshData);
    return freshData;
  },
};
