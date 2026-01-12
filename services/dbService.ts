import { Project, User, UserRole, FieldDefinition, ScopeDefinition, TechnicalComponent } from '../types';

// Keys for LocalStorage (The "Database")
const USERS_KEY = 'softestimate_users';
const PROJECTS_KEY = 'softestimate_projects';
const CURRENT_USER_KEY = 'softestimate_current_user';
const FIELDS_CONFIG_KEY = 'softestimate_fields_config';
const SCOPE_CONFIG_KEY = 'softestimate_scope_config';
const COMPONENTS_CONFIG_KEY = 'softestimate_components_config';

// Helper to simulate async DB calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- SEED DATA (Used only for Database Initialization) ---
// These are not used directly by the app logic once the database (LocalStorage) is initialized.
const INITIAL_FIELD_SEEDS: FieldDefinition[] = [
  { id: 'f1', label: 'Doküman Adı', placeholder: 'Örn: CRM Modül Geliştirimi', required: true, order: 1 },
  { id: 'f2', label: 'İstek Tipi', placeholder: 'Örn: Yeni Geliştirme, Hata Düzeltme', required: true, order: 2 },
  { id: 'f3', label: 'İstek No', placeholder: 'Örn: REQ-2024-001', required: false, order: 3 },
  { id: 'f4', label: 'İstek Adı', placeholder: 'Kısa başlık', required: true, order: 4 },
  { id: 'f5', label: 'İstek Tanımı', placeholder: 'Detaylı gereksinim açıklaması...', required: true, order: 5 },
  { id: 'f6', label: 'Referans GTD', placeholder: 'İlgili teknik doküman ref.', required: false, order: 6 },
];

const INITIAL_SCOPE_SEEDS: ScopeDefinition[] = [
  { id: 's1', category: 'Analiz', item: 'İş Analizi' },
  { id: 's2', category: 'Analiz', item: 'Teknik Analiz' },
  { id: 's3', category: 'Tasarım', item: 'Teknik Tasarım' },
  { id: 's4', category: 'Geliştirme', item: 'Kodlama' },
  { id: 's5', category: 'Geliştirme', item: 'Birim Test' },
  { id: 's6', category: 'Test', item: 'Entegrasyon' },
  { id: 's7', category: 'Test', item: 'Demo' },
  { id: 's8', category: 'Test', item: 'Fonksiyonel' },
  { id: 's9', category: 'Test', item: 'Kullanıcı Kabul' },
  { id: 's10', category: 'Test', item: 'Performans' },
  { id: 's11', category: 'Test', item: 'Regresyon' },
  { id: 's12', category: 'Devreye Alım', item: 'Devreye Alım Desteği' },
];

const INITIAL_COMPONENT_SEEDS: TechnicalComponent[] = [
  {
    id: 'c1',
    name: 'Service Consume',
    description: 'İstemci olarak tüketilen EJB / Web Servisler',
    usage: 'Bir istemci olarak yeni EJB/ Web servis çağırmak ya da mevcutta çağrılan EJB/ Web serviste değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Parametre Sayısı\n>> EBO Çeşitliliği\n>> Tip Karmaşıklığı'
  },
  {
    id: 'c2',
    name: 'Service Expose',
    description: 'Tüketilmesi için sunulan EJB / Web Servisler',
    usage: 'Yeni EJB/ Web servis sunmak ya da mevcutta sunulan EJB/ Web serviste değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Parametre Sayısı\n>> EBO Çeşitliliği\n>> Tip Karmaşıklığı'
  },
  {
    id: 'c3',
    name: 'User Screen',
    description: 'Oracle ADF kullanılarak geliştirilen ekranlar',
    usage: 'Yeni ADF ekran geliştirmek ya da mevcut ekranda değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Ekranda Bulunan Alan Sayısı\n>> Alanlar Arası İlişki Sayısı'
  },
  {
    id: 'c4',
    name: 'Rules & Validations via Groovy Script',
    description: 'Groovy Script kullanımı ile gerçekleştirilen validasyon kuralları',
    usage: 'Yeni bir validasyon scripti oluşturmak ya da mevcut scriptte değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Erişilecek Alan Sayısı\n>> Erişilecek Alanların Tip Çeşitliliği'
  },
  {
    id: 'c5',
    name: 'Rules & Validations via Java Code',
    description: 'Kod geliştirmesi ile gerçekleştirilen validasyon kuralları',
    usage: 'Yeni bir rule executor kodu yazmak ya da mevcut kodda değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Erişilecek Alan Sayısı'
  },
  {
    id: 'c6',
    name: 'Validation Engine',
    description: 'Grup olarak işletilen validasyon setleri',
    usage: 'Yeni bir grup validasyon seti oluşturmak ya da mevcut validasyon setinde değişiklik yapmak için kullanılır. Kanallara sunulan validasyon servisi üzerinden dışa açılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Validasyon Tipi (Spec) Sayısı'
  },
  {
    id: 'c7',
    name: 'Query',
    description: 'PL/SQL veya ADF Query kullanılarak geliştirilen Entity/ View objeleri',
    usage: 'Yeni PL/SQL sorgusu yazmak veya ADF Query geliştirmek ya da mevcut bileşende değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Input Parametre Sayısı\n>> Tablo Çeşitliliği (Join Sayısı)'
  },
  {
    id: 'c8',
    name: 'Business Logic Orchestrator',
    description: 'İş kuralı işletmek için geliştirilen Java Controller classları',
    usage: 'Yeni bir Business Logic Orchestrator oluşturmak ya da mevcut controller class\'ında değişiklik yapmak için kullanılır. İlgili Java Controller classı belirli iş kurallarını işletmek veya bir hesaplama yapmak için geliştirilir.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> İşletilen Kural Sayısı\n>> Çağrılan Sorgu (Query) ve Servis (Service Consume) Sayısı\n>> Çağrılan Validasyon Sayısı'
  },
  {
    id: 'c9',
    name: 'Task Flow',
    description: 'BI\'lar için işletilen İş Akışları',
    usage: 'Yeni bir Task Flow oluşturmak ya da mevcut akışta değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Ekran Sayısı\n>> Çağrılan Task Flow Sayısı\n>> Input ve Return Parametre Sayısı'
  },
  {
    id: 'c10',
    name: 'DB Model',
    description: 'Veri Tabanı tabloları',
    usage: 'Veri modelinde yeni tablo(lar) oluşturmak ya da değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Tablo Sayısı\n>> Tabloda Bulunan Alan Sayısı'
  },
  {
    id: 'c11',
    name: 'Privilege / Permission',
    description: 'Kullanıcı Yönetimi ve Kanal Yönetimi',
    usage: 'Yeni Kullanıcı/ Kanal yetkisi tanımlamak ya da mevcut yetkilerde değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Alan sayısı\n>> Yetki tipi sayısı'
  },
  {
    id: 'c12',
    name: 'Product Catalog',
    description: 'Ürün/ Tarife/ Paket ve Cihaz tanımları',
    usage: 'Katalog\'da yeni ürün/ cihaz tanımları ve bunlarla ilişkili katalog objeleri (tarife, paket, kampanya, vb.) oluşturmak ya da mevcut katalog objelerinde değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Katalog Objesi Sayısı\n>> Obje Tanımlama (Spec) Çeşitliliği'
  },
  {
    id: 'c13',
    name: 'Configuration Script',
    description: 'Değer Listesi (LOV) ve Karakteristik tanımları',
    usage: 'Veritabanına eklenecek değerler için yeni konfigurasyon scripti oluşturmak için kullanılır.',
    complexityCriteria: '>> Eklenecek Değer Kümesi Sayısı (Insert Scripti olduğu için güncelleme kırılımı içermez)'
  },
  {
    id: 'c14',
    name: 'Document Reporting (iReport)',
    description: 'iReport kullanılarak geliştirilen formlar',
    usage: 'Yeni PDF şablonu oluşturmak ya da mevcut şablonda değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> PDF Şablonundaki Alan Sayısı\n>> Kullanılacak Alanların Business Entity Çeşitliliği'
  },
  {
    id: 'c15',
    name: 'Syncronization',
    description: 'Opera\'da tutulan Müşterilerin ve Varlıkların dış sistemlerce güncellenen verilerinin senkronizasyonu',
    usage: 'Senkronizasyon prosedürlerinde değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Eklenecek Parametre Sayısı (Müşteri ve Varlık dışında farklı bir objenin senkronizasyonu yapılmayacağı için yeni bileşen oluşturma kırılımı içermez)'
  },
  {
    id: 'c16',
    name: 'Datamart',
    description: 'DWH\'de geliştirilen Datamart\'lar',
    usage: 'Veri modelindeki objelerin aktarılacağı yeni datamart oluşturmak ya da mevcut datamart\'ta değişiklik yapmak için kullanılır.',
    complexityCriteria: '>> Yeni Bileşen Oluşturma / Varolan Bileşeni Güncelleme\n>> Datamart\'ın İçereceği Alan Sayısı\n>> Kullanılacak Alanların Business Entity Çeşitliliği'
  },
  {
    id: 'c17',
    name: 'Migration',
    description: 'Opera DB\'ye toplu veri aktarımı',
    usage: 'Veri Tabanına toplu veri aktarma ihtiyacı olması durumunda kullanılır.',
    complexityCriteria: '>> Aktarılacak Verinin Boyutu\n>> Aktarılacak Verinin Çeşitliliği\n>> Aktarılacak Verinin Kirliliği / Temizleme İhtiyacı\n>> Veri Transformasyonu İhtiyacı (Migration Scripti olduğu için güncelleme kırılımı içermez)'
  }
];

export const dbService = {
  // --- Auth & User Methods ---

  async login(email: string): Promise<User | null> {
    await delay(500); 
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.email === email);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  async register(name: string, email: string, role: UserRole): Promise<User> {
    await delay(500);
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email === email)) {
      throw new Error('Kullanıcı zaten mevcut');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // --- Configuration Methods (Admin) ---

  async getFieldDefinitions(): Promise<FieldDefinition[]> {
    await delay(200);
    // Try to fetch from "Database" (LocalStorage)
    const configStr = localStorage.getItem(FIELDS_CONFIG_KEY);
    
    if (!configStr) {
      // Database initialization (Seeding)
      console.log("Database: Seeding default Field Definitions...");
      localStorage.setItem(FIELDS_CONFIG_KEY, JSON.stringify(INITIAL_FIELD_SEEDS));
      return INITIAL_FIELD_SEEDS;
    }
    
    // Return data from "Database"
    return JSON.parse(configStr).sort((a: FieldDefinition, b: FieldDefinition) => a.order - b.order);
  },

  async saveFieldDefinitions(fields: FieldDefinition[]): Promise<void> {
    await delay(300);
    localStorage.setItem(FIELDS_CONFIG_KEY, JSON.stringify(fields));
  },

  async getScopeDefinitions(): Promise<ScopeDefinition[]> {
    await delay(200);
    // Try to fetch from "Database" (LocalStorage)
    const configStr = localStorage.getItem(SCOPE_CONFIG_KEY);
    
    if (!configStr) {
      // Database initialization (Seeding)
      console.log("Database: Seeding default Scope Definitions...");
      localStorage.setItem(SCOPE_CONFIG_KEY, JSON.stringify(INITIAL_SCOPE_SEEDS));
      return INITIAL_SCOPE_SEEDS;
    }
    
    // Return data from "Database"
    return JSON.parse(configStr);
  },

  async saveScopeDefinitions(items: ScopeDefinition[]): Promise<void> {
    await delay(300);
    localStorage.setItem(SCOPE_CONFIG_KEY, JSON.stringify(items));
  },

  // --- Technical Components Methods (Admin) ---

  async getTechnicalComponents(): Promise<TechnicalComponent[]> {
    await delay(200);
    const configStr = localStorage.getItem(COMPONENTS_CONFIG_KEY);
    
    if (!configStr) {
      console.log("Database: Seeding default Technical Components...");
      localStorage.setItem(COMPONENTS_CONFIG_KEY, JSON.stringify(INITIAL_COMPONENT_SEEDS));
      return INITIAL_COMPONENT_SEEDS;
    }
    return JSON.parse(configStr);
  },

  async saveTechnicalComponents(items: TechnicalComponent[]): Promise<void> {
    await delay(300);
    localStorage.setItem(COMPONENTS_CONFIG_KEY, JSON.stringify(items));
  },

  // --- Project / Estimate Methods ---

  async getProjects(userId: string, role: UserRole): Promise<Project[]> {
    await delay(300);
    const projectsStr = localStorage.getItem(PROJECTS_KEY);
    const projects: Project[] = projectsStr ? JSON.parse(projectsStr) : [];
    
    // Admins see all projects, Users see only their own
    if (role === 'ADMIN') {
        return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return projects.filter(p => p.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getProjectById(id: string): Promise<Project | undefined> {
    await delay(200);
    const projectsStr = localStorage.getItem(PROJECTS_KEY);
    const projects: Project[] = projectsStr ? JSON.parse(projectsStr) : [];
    return projects.find(p => p.id === id);
  },

  async saveProject(project: Project): Promise<void> {
    await delay(500);
    const projectsStr = localStorage.getItem(PROJECTS_KEY);
    let projects: Project[] = projectsStr ? JSON.parse(projectsStr) : [];
    
    const existingIndex = projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  async deleteProject(id: string): Promise<void> {
    await delay(300);
    const projectsStr = localStorage.getItem(PROJECTS_KEY);
    let projects: Project[] = projectsStr ? JSON.parse(projectsStr) : [];
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }
};