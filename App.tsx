import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Calculator, LayoutDashboard, LogOut, Plus, 
  Settings, Clock, AlertTriangle, Trash2, GripVertical,
  Database, Loader2, Code2, DollarSign, Save, ListChecks, CheckSquare, Square, FileText,
  MoreVertical, Edit, FileEdit, Calendar, Activity, Cpu, Layers, X, ChevronDown, ChevronUp,
  SlidersHorizontal, ArrowRight, BarChart3, Briefcase
} from 'lucide-react';

import { dbService } from './services/dbService';
// geminiService is no longer used in the creation phase, will be used later in workspace
// import { geminiService } from './services/geminiService'; 
import { User, Project, ProjectComplexity, EstimateResult, UserRole, FieldDefinition, FieldValue, ScopeDefinition, ScopeSelection, TechnicalComponent, ProjectEffortRecord, ComponentType, ComponentComplexityLevel } from './types';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  register: (name: string, email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = dbService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string) => {
    const u = await dbService.login(email);
    if (u) setUser(u);
    else throw new Error('Kullanıcı bulunamadı');
  };

  const register = async (name: string, email: string, role: UserRole) => {
    const u = await dbService.register(name, email, role);
    setUser(u);
  };

  const logout = async () => {
    await dbService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// --- Components ---

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 font-bold text-xl">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-900/50">
               <Calculator size={24} strokeWidth={2.5} />
            </div>
            <span className="tracking-tight text-white">SoftEstimator</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <LayoutDashboard size={20} />
            <span>Projeler</span>
          </Link>
          <Link to="/new" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <Plus size={20} />
            <span>Yeni Proje</span>
          </Link>

          {/* Admin Only Link */}
          {user?.role === 'ADMIN' && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
               <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Yönetici Paneli</p>
               <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                  <FileText size={20} />
                  <span>Proje Tanımı</span>
                </Link>
                <Link to="/admin/components" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                  <Cpu size={20} />
                  <span>Teknik Bileşenler</span>
                </Link>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate text-white">{user?.name}</p>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${user?.role === 'ADMIN' ? 'bg-red-900 text-red-200' : 'bg-slate-800 text-slate-300'}`}>
                  {user?.role}
                </span>
                <p className="text-xs text-slate-400 truncate flex-1">{user?.email}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-slate-800 rounded hover:bg-red-900/50 hover:text-red-200 transition-colors text-slate-300"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
          
          <div className="mt-4 text-center">
             <span className="text-[10px] text-slate-600 font-medium">Developed by DefineX - Tech Design</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

// --- Pages ---

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email);
      } else {
        await register(name, email, role);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans relative">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md z-10">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center text-white transform rotate-3">
            <Calculator size={40} strokeWidth={2} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
        </h2>
        <p className="text-center text-gray-500 mb-8 font-medium">
          SoftEstimator Proje Yönetimi
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Türü</label>
                <div className="grid grid-cols-2 gap-2">
                   <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${role === 'USER' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                   >
                     Kullanıcı
                   </button>
                   <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${role === 'ADMIN' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                   >
                     Admin (Yönetici)
                   </button>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-center w-full text-gray-400 text-xs font-medium">
        Developed by DefineX - Tech Design
      </div>
    </div>
  );
};

const AdminComponents: React.FC = () => {
  const [components, setComponents] = useState<TechnicalComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // UI State for expansion
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUsage, setNewUsage] = useState('');
  const [newCriteria, setNewCriteria] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await dbService.getTechnicalComponents();
    setComponents(data);
    setLoading(false);
  };

  const handleEditComponent = (comp: TechnicalComponent) => {
    setEditingId(comp.id);
    setNewName(comp.name);
    setNewDesc(comp.description);
    setNewUsage(comp.usage);
    setNewCriteria(comp.complexityCriteria);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName('');
    setNewDesc('');
    setNewUsage('');
    setNewCriteria('');
  };

  const handleSaveComponent = () => {
    if (!newName.trim() || !newDesc.trim()) {
      alert('Lütfen en az Bileşen Adı ve Tanımını giriniz.');
      return;
    }

    let updatedList = [...components];

    if (editingId) {
      // Update existing
      updatedList = updatedList.map(c => 
        c.id === editingId 
          ? { ...c, name: newName, description: newDesc, usage: newUsage, complexityCriteria: newCriteria }
          : c
      );
    } else {
      // Create new
      const newComponent: TechnicalComponent = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        description: newDesc,
        usage: newUsage,
        complexityCriteria: newCriteria
      };
      updatedList.push(newComponent);
    }

    setComponents(updatedList);
    
    // Reset Form
    handleCancelEdit();
  };

  const handleDeleteComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const handleSaveToDB = async () => {
    setSaving(true);
    await dbService.saveTechnicalComponents(components);
    setSaving(false);
    alert('Teknik bileşenler başarıyla kaydedildi!');
  };

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header & Main Save Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teknik Bileşen Tanımları</h1>
          <p className="text-gray-500">Proje tahminlerinde kullanılacak teknik bileşenleri yönetin.</p>
        </div>
        <button 
          onClick={handleSaveToDB}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
        >
          <Save size={18} />
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      {/* FORM SECTION (Top) */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
          {editingId ? <Edit size={20} className="text-orange-500"/> : <Plus size={20} className="text-blue-500"/>} 
          {editingId ? 'Bileşeni Düzenle' : 'Yeni Bileşen Ekle'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bileşen Adı <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Örn: RabbitMQ Message Broker"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bileşen Tanımı <span className="text-red-500">*</span></label>
            <textarea 
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Bileşenin teknik tanımını yapınız..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bileşen Kullanımı</label>
            <textarea 
              rows={3}
              value={newUsage}
              onChange={(e) => setNewUsage(e.target.value)}
              placeholder="Hangi durumlarda tercih edilmeli?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Karmaşıklık Kriterleri</label>
            <textarea 
              rows={3}
              value={newCriteria}
              onChange={(e) => setNewCriteria(e.target.value)}
              placeholder="Eforu artıran faktörler nelerdir?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
           {editingId && (
            <button 
              onClick={handleCancelEdit}
              className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition border border-gray-300"
            >
              Vazgeç
            </button>
           )}
          <button 
            onClick={handleSaveComponent}
            className={`px-6 py-2 rounded-lg font-semibold text-white transition shadow-sm flex items-center gap-2 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {editingId ? <><Edit size={16}/> Güncelle</> : <><Plus size={16}/> Listeye Ekle</>}
          </button>
        </div>
      </div>

      {/* LIST SECTION (Bottom) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
           <ListChecks size={24} className="text-gray-600"/> Mevcut Bileşen Listesi 
           <span className="text-sm font-normal text-gray-500 ml-2">({components.length} Kayıt)</span>
        </h3>

        {components.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-500 flex flex-col items-center justify-center">
            <Cpu size={48} className="text-gray-300 mb-3"/>
            <p>Henüz tanımlı teknik bileşen bulunmamaktadır.</p>
            <p className="text-sm mt-2">Yukarıdaki formu kullanarak yeni bileşen ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {components.map(component => {
              const isExpanded = expandedIds.has(component.id);
              return (
                <div 
                  key={component.id} 
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-all duration-200 hover:shadow-md border-l-4 ${editingId === component.id ? 'border-l-orange-500 ring-2 ring-orange-100' : 'border-l-blue-500'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${editingId === component.id ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Cpu size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">{component.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditComponent(component);
                        }}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                        title="Düzenle"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteComponent(component.id);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 cursor-pointer"
                    onClick={() => toggleExpand(component.id)}
                    title={isExpanded ? "Kapat" : "Detayları görmek için tıklayın"}
                  >
                    <div className="md:col-span-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Tanım</h4>
                      <p className={`text-sm text-gray-700 ${!isExpanded && 'line-clamp-2'}`}>
                        {component.description}
                      </p>
                    </div>
                    
                    <div className="md:col-span-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                         Kullanım
                      </h4>
                      <p className={`text-sm text-gray-600 ${!isExpanded && 'line-clamp-2'}`}>
                        {component.usage || '-'}
                      </p>
                    </div>

                    <div className="md:col-span-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                         Karmaşıklık
                      </h4>
                      <p className={`text-sm text-gray-600 ${!isExpanded && 'line-clamp-2'}`}>
                        {component.complexityCriteria || '-'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Indicator */}
                  <div 
                    className="flex justify-center mt-2 -mb-2"
                    onClick={() => toggleExpand(component.id)}
                  >
                     <button className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                        {isExpanded ? <><ChevronUp size={14}/> Daralt</> : <><ChevronDown size={14}/> Detayları Göster</>}
                     </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// NEW: User-facing Effort Planning Component
const ProjectEffortPlanning: React.FC = () => {
  const { id } = useParams(); // Project ID
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [components, setComponents] = useState<TechnicalComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [selectedComponentId, setSelectedComponentId] = useState('');
  const [type, setType] = useState<ComponentType>('Yeni');
  const [complexity, setComplexity] = useState<ComponentComplexityLevel>('Orta');
  
  const [devEffort, setDevEffort] = useState<number>(0);
  const [analysisRatio, setAnalysisRatio] = useState<number>(0);
  const [designRatio, setDesignRatio] = useState<number>(0);
  const [testRatio, setTestRatio] = useState<number>(0);
  const [deployRatio, setDeployRatio] = useState<number>(0);

  // Local list of efforts before saving
  const [effortsList, setEffortsList] = useState<ProjectEffortRecord[]>([]);

  useEffect(() => {
    const init = async () => {
      if(id) {
         const p = await dbService.getProjectById(id);
         const c = await dbService.getTechnicalComponents();
         setProject(p || null);
         setComponents(c);
         if(p && p.efforts) {
           setEffortsList(p.efforts);
         }
         setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleAddComponent = () => {
    if(!selectedComponentId) {
      alert("Lütfen bir bileşen seçiniz.");
      return;
    }
    const comp = components.find(c => c.id === selectedComponentId);
    if(!comp) return;

    const newEffort: ProjectEffortRecord = {
      id: Math.random().toString(36).substr(2, 9),
      componentId: selectedComponentId,
      componentName: comp.name,
      type,
      complexity,
      developmentDays: Number(devEffort),
      analysisRatio: Number(analysisRatio),
      designRatio: Number(designRatio),
      testRatio: Number(testRatio),
      deployRatio: Number(deployRatio)
    };

    setEffortsList([...effortsList, newEffort]);
    
    // Reset inputs
    setSelectedComponentId('');
    setType('Yeni');
    setComplexity('Orta');
    setDevEffort(0);
    setAnalysisRatio(0);
    setDesignRatio(0);
    setTestRatio(0);
    setDeployRatio(0);
  };

  const removeEffort = (effortId: string) => {
    setEffortsList(effortsList.filter(e => e.id !== effortId));
  };

  const handleSaveAndReport = async () => {
    if(!project) return;
    setSaving(true);
    const updatedProject: Project = { ...project, efforts: effortsList };
    await dbService.saveProject(updatedProject);
    setSaving(false);
    navigate(`/project/${project.id}`);
  };

  const calculateTotalRow = (e: ProjectEffortRecord) => {
     const dev = e.developmentDays;
     const analysis = dev * (e.analysisRatio / 100);
     const design = dev * (e.designRatio / 100);
     const test = dev * (e.testRatio / 100);
     const deploy = dev * (e.deployRatio / 100);
     return (dev + analysis + design + test + deploy).toFixed(2);
  };

  if(loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if(!project) return <div>Proje bulunamadı</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
           <Link to={`/project/${project.id}`} className="text-sm text-gray-500 hover:text-blue-600 mb-1 flex items-center gap-1">
             &larr; Proje Detayına Dön
           </Link>
           <h1 className="text-2xl font-bold text-gray-900">Efor Planlaması: {project.name}</h1>
        </div>
      </div>

      {/* INPUT FORM */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
           <Plus size={20} className="text-blue-500"/> Yeni Bileşen Eforu Ekle
        </h2>

        {/* Row 1: Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teknik Bileşen</label>
            <select 
              value={selectedComponentId} 
              onChange={e => setSelectedComponentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
            >
              <option value="">Seçiniz</option>
              {components.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value as ComponentType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
            >
              <option value="Yeni">Yeni</option>
              <option value="Güncelleme">Güncelleme</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Karmaşıklık</label>
            <select 
              value={complexity} 
              onChange={e => setComplexity(e.target.value as ComponentComplexityLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
            >
              <option value="Çok Düşük">Çok Düşük</option>
              <option value="Düşük">Düşük</option>
              <option value="Orta">Orta</option>
              <option value="Yüksek">Yüksek</option>
            </select>
          </div>
        </div>

        {/* Row 2: Dev Effort */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
           <label className="block text-sm font-bold text-blue-900 mb-1">Geliştirme Eforu (Gün)</label>
           <p className="text-xs text-blue-700 mb-2">Baz alınan efor.</p>
           <input 
             type="number" 
             step="0.1"
             value={devEffort}
             onChange={e => setDevEffort(parseFloat(e.target.value) || 0)}
             className="w-full md:w-1/3 px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold text-gray-900 bg-white"
             placeholder="0.0"
           />
        </div>

        {/* Row 3: Ratios */}
        <h3 className="text-md font-bold text-gray-700 mb-4">Faz Oranları (%)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           {[
             { label: 'Analiz', val: analysisRatio, set: setAnalysisRatio },
             { label: 'Tasarım', val: designRatio, set: setDesignRatio },
             { label: 'Test', val: testRatio, set: setTestRatio },
             { label: 'Deploy', val: deployRatio, set: setDeployRatio },
           ].map((item, idx) => (
             <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
               <label className="block text-xs font-semibold text-gray-500 mb-1">{item.label} %</label>
               <input 
                  type="number" 
                  value={item.val}
                  onChange={e => item.set(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-center font-medium text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 outline-none"
               />
               <div className="text-xs text-center mt-2 text-gray-400">
                 = {(devEffort * (item.val/100)).toFixed(2)} Gün
               </div>
             </div>
           ))}
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleAddComponent}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
          >
            <Plus size={18} /> Listeye Ekle
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Planlanan Bileşenler</h3>
            <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded text-gray-600">{effortsList.length} Kalem</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                     <th className="p-3">Bileşen</th>
                     <th className="p-3">Tip/Karmaşıklık</th>
                     <th className="p-3 text-center">Dev (Gün)</th>
                     <th className="p-3 text-center">Oranlar (A/T/Te/D)</th>
                     <th className="p-3 text-right font-bold">Toplam (Gün)</th>
                     <th className="p-3 text-right">İşlem</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {effortsList.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-400">Henüz bileşen eklenmedi.</td></tr>
                 ) : (
                   effortsList.map(item => (
                     <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">{item.componentName}</td>
                        <td className="p-3 text-gray-600 text-xs">
                          {item.type} / {item.complexity}
                        </td>
                        <td className="p-3 text-center font-bold text-blue-600">{item.developmentDays}</td>
                        <td className="p-3 text-center text-xs text-gray-500">
                          %{item.analysisRatio} / %{item.designRatio} / %{item.testRatio} / %{item.deployRatio}
                        </td>
                        <td className="p-3 text-right font-bold text-gray-800">
                          {calculateTotalRow(item)}
                        </td>
                        <td className="p-3 text-right">
                           <button onClick={() => removeEffort(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                             <Trash2 size={16}/>
                           </button>
                        </td>
                     </tr>
                   ))
                 )}
               </tbody>
               {effortsList.length > 0 && (
                 <tfoot className="bg-gray-50 font-bold text-gray-900">
                    <tr>
                      <td colSpan={4} className="p-3 text-right">GENEL TOPLAM:</td>
                      <td className="p-3 text-right text-blue-700 text-lg">
                        {effortsList.reduce((sum, item) => sum + parseFloat(calculateTotalRow(item)), 0).toFixed(2)} Gün
                      </td>
                      <td></td>
                    </tr>
                 </tfoot>
               )}
            </table>
         </div>
      </div>

      <div className="flex justify-end pt-4">
         <button 
           onClick={handleSaveAndReport}
           disabled={saving || effortsList.length === 0}
           className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {saving ? <Loader2 className="animate-spin"/> : <Save size={20} />}
           Kaydet ve Raporu Gör
         </button>
      </div>

    </div>
  );
};

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fields' | 'scope'>('fields');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Fields State
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');

  // Scope State
  const [scopeItems, setScopeItems] = useState<ScopeDefinition[]>([]);
  const [newScopeCategory, setNewScopeCategory] = useState('Analiz');
  const [newScopeItem, setNewScopeItem] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [fieldsData, scopeData] = await Promise.all([
      dbService.getFieldDefinitions(),
      dbService.getScopeDefinitions()
    ]);
    setFields(fieldsData);
    setScopeItems(scopeData);
    setLoading(false);
  };

  // --- Field Handlers ---
  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;
    const newField: FieldDefinition = {
      id: Math.random().toString(36).substr(2, 9),
      label: newFieldLabel,
      required: false,
      placeholder: '',
      order: fields.length + 1
    };
    setFields([...fields, newField]);
    setNewFieldLabel('');
  };

  const handleDeleteField = (id: string) => {
    if(confirm('Bu alanı silmek istediğinize emin misiniz?')) {
      setFields(fields.filter(f => f.id !== id));
    }
  };

  const toggleRequired = (index: number) => {
    const updated = [...fields];
    updated[index].required = !updated[index].required;
    setFields(updated);
  };

  // --- Scope Handlers ---
  const handleAddScopeItem = () => {
    if (!newScopeItem.trim()) return;
    const newItem: ScopeDefinition = {
      id: Math.random().toString(36).substr(2, 9),
      category: newScopeCategory,
      item: newScopeItem
    };
    setScopeItems([...scopeItems, newItem]);
    setNewScopeItem('');
  };

  const handleDeleteScopeItem = (id: string) => {
    // Removed confirm dialog to fix user issue with non-responsive button
    setScopeItems(prevItems => prevItems.filter(s => s.id !== id));
  };

  // --- Save Handler ---
  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      dbService.saveFieldDefinitions(fields),
      dbService.saveScopeDefinitions(scopeItems)
    ]);
    setSaving(false);
    alert('Tüm ayarlar veritabanına kaydedildi!');
  };

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proje Tanımları</h1>
          <p className="text-gray-500">Proje şablon yapılarını ve kapsam maddelerini veritabanında yönetin.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Save size={18} />
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'fields' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Proje Alanları
        </button>
        <button 
          onClick={() => setActiveTab('scope')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'scope' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Kapsam Tanımları
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        {activeTab === 'fields' ? (
          /* Fields Management Tab */
          <div>
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-500 grid grid-cols-12 gap-4">
              <div className="col-span-1 text-center">Sıra</div>
              <div className="col-span-6">Alan Adı (Etiket)</div>
              <div className="col-span-3 text-center">Zorunlu?</div>
              <div className="col-span-2 text-center">İşlem</div>
            </div>

            <div className="divide-y divide-gray-100">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-1 text-center text-gray-400">
                    <GripVertical size={20} className="mx-auto" />
                  </div>
                  <div className="col-span-6">
                    <input 
                      type="text" 
                      value={field.label}
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[index].label = e.target.value;
                        setFields(updated);
                      }}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="col-span-3 text-center">
                    <input 
                      type="checkbox" 
                      checked={field.required} 
                      onChange={() => toggleRequired(index)}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                  </div>
                  <div className="col-span-2 text-center">
                    <button 
                      onClick={() => handleDeleteField(field.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-2">
                 <input 
                  type="text" 
                  placeholder="Yeni alan adı (örn: Proje Sponsoru)" 
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  onClick={handleAddField}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Alan Ekle
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Scope Management Tab */
          <div>
            <div className="p-4 bg-blue-50 border-b border-blue-100 text-sm text-blue-800">
              Burada tanımladığınız maddeler, yeni proje oluşturulurken kullanıcılara "Kapsam İçi/Dışı" olarak sunulacaktır.
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Group items by category */}
              {Array.from(new Set(scopeItems.map(i => i.category))).map(category => (
                <div key={category} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">{category}</h3>
                  <ul className="space-y-2">
                    {scopeItems.filter(i => i.category === category).map(item => (
                      <li key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm relative">
                        <span className="text-sm text-gray-700">{item.item}</span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScopeItem(item.id);
                          }}
                          className="relative z-10 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={16} className="pointer-events-none" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-2 flex-col md:flex-row">
                 <select
                   value={newScopeCategory}
                   onChange={(e) => setNewScopeCategory(e.target.value)}
                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                 >
                   <option value="Analiz">Analiz</option>
                   <option value="Tasarım">Tasarım</option>
                   <option value="Geliştirme">Geliştirme</option>
                   <option value="Test">Test</option>
                   <option value="Devreye Alım">Devreye Alım</option>
                   <option value="Bakım">Bakım</option>
                   <option value="Dokümantasyon">Dokümantasyon</option>
                 </select>
                 <input 
                  type="text" 
                  placeholder="Yeni madde adı (örn: Güvenlik Testleri)" 
                  value={newScopeItem}
                  onChange={(e) => setNewScopeItem(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  onClick={handleAddScopeItem}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Madde Ekle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      dbService.getProjectById(id).then(p => {
        setProject(p || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div>;
  if (!project) return <div>Proje bulunamadı.</div>;

  const groupedScope = (project.scopeSelections || []).reduce((acc, curr) => {
    (acc[curr.category] = acc[curr.category] || []).push(curr);
    return acc;
  }, {} as Record<string, ScopeSelection[]>);

  // --- MANUAL REPORT CALCULATION ---
  const hasEfforts = project.efforts && project.efforts.length > 0;
  
  let totalDev = 0, totalAnalysis = 0, totalDesign = 0, totalTest = 0, totalDeploy = 0, grandTotalDays = 0;
  let chartData: any[] = [];
  let barData: any[] = [];

  if (hasEfforts) {
    project.efforts!.forEach(e => {
       const dev = e.developmentDays;
       const an = dev * (e.analysisRatio / 100);
       const des = dev * (e.designRatio / 100);
       const tst = dev * (e.testRatio / 100);
       const dep = dev * (e.deployRatio / 100);
       
       totalDev += dev;
       totalAnalysis += an;
       totalDesign += des;
       totalTest += tst;
       totalDeploy += dep;
       
       const itemTotal = dev + an + des + tst + dep;
       barData.push({
         name: e.componentName,
         total: parseFloat(itemTotal.toFixed(2))
       });
    });

    grandTotalDays = totalDev + totalAnalysis + totalDesign + totalTest + totalDeploy;
    
    chartData = [
      { name: 'Analiz', value: parseFloat(totalAnalysis.toFixed(2)) },
      { name: 'Tasarım', value: parseFloat(totalDesign.toFixed(2)) },
      { name: 'Geliştirme', value: parseFloat(totalDev.toFixed(2)) },
      { name: 'Test', value: parseFloat(totalTest.toFixed(2)) },
      { name: 'Deploy', value: parseFloat(totalDeploy.toFixed(2)) },
    ];
  }

  // Cost Assumption (Example: $400 / day)
  const totalCost = grandTotalDays * 400;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                {project.complexity}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Calendar size={14} className="text-blue-500" />
              <span>Oluşturulma: <span className="font-medium text-gray-700">{new Date(project.createdAt).toLocaleDateString('tr-TR')}</span></span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
              {project.customFields.map((field) => (
                <div key={field.fieldId}>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{field.label}</p>
                  <p className="text-gray-900 font-medium">{field.value || '-'}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Action Button for Planning */}
        <div className="flex justify-end border-t pt-4">
           <Link 
             to={`/project/${project.id}/plan`}
             className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition flex items-center gap-2 shadow-lg"
           >
             {hasEfforts ? <><Edit size={16}/> Efor Planını Düzenle</> : <><SlidersHorizontal size={16}/> Efor Planlaması Başlat</>}
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Scope Visualization */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckSquare size={18} className="text-blue-500"/> Kapsam Durumu
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
             {Object.keys(groupedScope).map(category => (
               <div key={category}>
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{category}</h4>
                 <div className="space-y-1">
                   {groupedScope[category].map(item => (
                     <div key={item.definitionId} className="flex items-center justify-between text-sm">
                       <span className={item.isInScope ? 'text-gray-800' : 'text-gray-400 line-through'}>
                         {item.item}
                       </span>
                       {item.isInScope ? (
                         <div className="bg-green-100 text-green-700 p-1 rounded-full"><CheckSquare size={12}/></div>
                       ) : (
                         <div className="bg-red-50 text-red-300 p-1 rounded-full"><Square size={12}/></div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Dashboard Area */}
        <div className="lg:col-span-2 space-y-8">
            {hasEfforts ? (
              <>
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center gap-3 mb-2 text-blue-300">
                      <DollarSign size={24} />
                      <span className="font-semibold">Toplam Maliyet</span>
                    </div>
                    <p className="text-3xl font-bold">
                      ${totalCost.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">~$50/saat (8h/gün) bazıyla</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-blue-600">
                      <Briefcase size={24} />
                      <span className="font-semibold">Toplam Efor</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {grandTotalDays.toFixed(1)} Gün
                    </p>
                    <p className="text-xs text-gray-400 mt-1">~{(grandTotalDays/5).toFixed(1)} Hafta</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-purple-600">
                      <Layers size={24} />
                      <span className="font-semibold">Bileşen Sayısı</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {project.efforts!.length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Farklı teknik bileşen</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500"/> Faz Efor Dağılımı (Gün)
                      </h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value: number) => `${value} Gün`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar Chart (Components) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                         <BarChart3 size={20} className="text-purple-500"/> Bileşen Bazlı Toplam Efor
                      </h3>
                      <div className="h-64 w-full text-xs">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
                              <RechartsTooltip formatter={(value: number) => `${value} Gün`} />
                              <Bar dataKey="total" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800">Efor Detay Tablosu</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Bileşen</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Geliştirme</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Analiz</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Tasarım</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Test</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Deploy</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Toplam (Gün)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {project.efforts!.map((e, i) => {
                             const dev = e.developmentDays;
                             return (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="p-4 font-medium text-gray-800">{e.componentName}</td>
                              <td className="p-4 text-center">{dev}</td>
                              <td className="p-4 text-center text-gray-500">{(dev * e.analysisRatio/100).toFixed(2)}</td>
                              <td className="p-4 text-center text-gray-500">{(dev * e.designRatio/100).toFixed(2)}</td>
                              <td className="p-4 text-center text-gray-500">{(dev * e.testRatio/100).toFixed(2)}</td>
                              <td className="p-4 text-center text-gray-500">{(dev * e.deployRatio/100).toFixed(2)}</td>
                              <td className="p-4 text-right font-bold text-blue-700">
                                {(dev + (dev*e.analysisRatio/100) + (dev*e.designRatio/100) + (dev*e.testRatio/100) + (dev*e.deployRatio/100)).toFixed(2)}
                              </td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                </div>
              </>
            ) : (
               <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                 <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <SlidersHorizontal className="text-blue-600 w-8 h-8"/>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Efor Planlaması Yapılmadı</h3>
                 <p className="text-gray-500 mb-6 max-w-md mx-auto">
                   Bu proje için henüz teknik bileşen eforu girilmemiş. Detaylı rapor ve grafikler için planlama yapmalısınız.
                 </p>
                 <Link 
                   to={`/project/${project.id}/plan`}
                   className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold shadow-lg inline-flex items-center gap-2"
                 >
                   Planlamaya Başla <ArrowRight size={18}/>
                 </Link>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Shell ---

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      dbService.getProjects(user.id, user.role).then(data => {
        setProjects(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projeler</h1>
          <p className="text-gray-500">Tüm yazılım geliştirme projeleriniz.</p>
        </div>
        <Link to="/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition">
          <Plus size={20} /> Yeni Proje
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 text-center">
           <div className="bg-blue-50 p-4 rounded-full mb-4">
             <LayoutDashboard size={40} className="text-blue-500"/>
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz proje bulunmuyor</h3>
           <p className="text-gray-500 mb-6 max-w-sm">
             Yeni bir proje oluşturarak efor tahmini ve planlaması yapmaya başlayabilirsiniz.
           </p>
           <Link to="/new" className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1">
             İlk Projeni Oluştur <ArrowRight size={16}/>
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(p => (
            <Link key={p.id} to={`/project/${p.id}`} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6 overflow-hidden flex flex-col h-full">
               <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-full -mr-4 -mt-4 z-0"></div>
               <div className="relative z-10 flex-1">
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm">
                     <Briefcase size={20} />
                   </div>
                   <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                     p.complexity === 'Basit' ? 'bg-green-100 text-green-700' :
                     p.complexity === 'Orta' ? 'bg-yellow-100 text-yellow-700' :
                     'bg-red-100 text-red-700'
                   }`}>
                     {p.complexity}
                   </span>
                 </div>
                 
                 <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                 <p className="text-gray-500 text-sm line-clamp-3 mb-6">
                   {p.description}
                 </p>
               </div>

               <div className="relative z-10 border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <Calendar size={14}/> {new Date(p.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  
                  {p.efforts && p.efforts.length > 0 ? (
                     <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <CheckSquare size={14}/> Planlandı
                     </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                        <Activity size={14}/> Taslak
                     </div>
                  )}
               </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectDefinitionForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Config Data
  const [fieldDefs, setFieldDefs] = useState<FieldDefinition[]>([]);
  const [scopeDefs, setScopeDefs] = useState<ScopeDefinition[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState<ProjectComplexity>(ProjectComplexity.MEDIUM);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [scopeSelectionState, setScopeSelectionState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const init = async () => {
      try {
        const [fDefs, sDefs] = await Promise.all([
          dbService.getFieldDefinitions(),
          dbService.getScopeDefinitions()
        ]);
        setFieldDefs(fDefs);
        setScopeDefs(sDefs);
        
        // Initialize Scope Selection State (default all checked for new projects)
        const initialScope: Record<string, boolean> = {};
        sDefs.forEach(s => initialScope[s.id] = true);

        if (id) {
          const p = await dbService.getProjectById(id);
          if (p) {
            setName(p.name);
            setDescription(p.description);
            setComplexity(p.complexity);
            
            const fVals: Record<string, string> = {};
            p.customFields.forEach(f => fVals[f.fieldId] = f.value);
            setFieldValues(fVals);

            // For existing project, use saved scope
            const sVals: Record<string, boolean> = {};
            // Initialize with saved
            p.scopeSelections.forEach(s => sVals[s.definitionId] = s.isInScope);
            // If new scope items were added since project creation, default them to false or true? 
            // Better to respect current definitions. If definition ID not in saved, add it as true or false.
            sDefs.forEach(s => {
               if(sVals[s.id] === undefined) sVals[s.id] = true;
            });
            setScopeSelectionState(sVals);
          }
        } else {
           setScopeSelectionState(initialScope);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      // Map fields
      const customFields: FieldValue[] = fieldDefs.map(def => ({
        fieldId: def.id,
        label: def.label,
        value: fieldValues[def.id] || ''
      }));

      // Map scope
      const scopeSelections: ScopeSelection[] = scopeDefs.map(def => ({
        definitionId: def.id,
        category: def.category,
        item: def.item,
        isInScope: scopeSelectionState[def.id] ?? false
      }));

      // Get existing efforts if editing
      let existingEfforts: ProjectEffortRecord[] = [];
      if(id) {
         const existing = await dbService.getProjectById(id);
         if(existing && existing.efforts) existingEfforts = existing.efforts;
      }

      const projectData: Project = {
        id: id || Math.random().toString(36).substr(2, 9),
        userId: user.id,
        name,
        description,
        complexity,
        createdAt: id ? (await dbService.getProjectById(id))?.createdAt || new Date().toISOString() : new Date().toISOString(),
        customFields,
        scopeSelections,
        estimate: null, // Legacy field
        efforts: existingEfforts 
      };

      await dbService.saveProject(projectData);
      navigate(`/project/${projectData.id}`);
    } catch (err) {
      alert('Hata oluştu');
      setSubmitting(false);
    }
  };

  const toggleScope = (defId: string) => {
    setScopeSelectionState(prev => ({
      ...prev,
      [defId]: !prev[defId]
    }));
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div>;

  // Group Scope Definitions by Category
  const groupedScope = scopeDefs.reduce((acc, curr) => {
    (acc[curr.category] = acc[curr.category] || []).push(curr);
    return acc;
  }, {} as Record<string, ScopeDefinition[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
       <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
         <Link to="/" className="hover:text-blue-600 transition">Projeler</Link>
         <span>/</span>
         <span className="text-gray-900 font-medium">{id ? 'Düzenle' : 'Yeni'}</span>
       </div>

       <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Proje Tanımını Düzenle' : 'Yeni Proje Oluştur'}
          </h1>
       </div>

       <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileEdit size={20}/></div>
               Temel Bilgiler
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-gray-700 mb-1">Proje Adı <span className="text-red-500">*</span></label>
                 <input 
                   type="text" 
                   required 
                   value={name} 
                   onChange={e => setName(e.target.value)} 
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                   placeholder="Örn: Mobil Bankacılık Yenileme"
                 />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-gray-700 mb-1">Açıklama <span className="text-red-500">*</span></label>
                 <textarea 
                   required 
                   rows={3} 
                   value={description} 
                   onChange={e => setDescription(e.target.value)} 
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                   placeholder="Proje hedefleri ve kapsamı hakkında kısa bilgi..."
                 />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Karmaşıklık Seviyesi</label>
                  <div className="relative">
                    <select 
                      value={complexity} 
                      onChange={e => setComplexity(e.target.value as ProjectComplexity)} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
                    >
                      {Object.values(ProjectComplexity).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16}/>
                  </div>
               </div>
             </div>
          </div>

          {/* Dynamic Fields */}
          {fieldDefs.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ListChecks size={20}/></div>
                 Proje Detayları
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fieldDefs.map(field => (
                  <div key={field.id} className={field.order > 100 ? "md:col-span-2" : ""}>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input 
                      type="text" 
                      required={field.required}
                      placeholder={field.placeholder}
                      value={fieldValues[field.id] || ''}
                      onChange={e => setFieldValues({...fieldValues, [field.id]: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scope Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
               <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckSquare size={20}/></div>
               Kapsam Yönetimi
            </h2>
            <p className="text-sm text-gray-500 mb-6 ml-11">Bu projede yer alacak çalışmaları işaretleyiniz.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(groupedScope).map(category => (
                <div key={category} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">{category}</h3>
                  <div className="space-y-2">
                    {groupedScope[category].map(def => {
                       const isChecked = scopeSelectionState[def.id] ?? false;
                       return (
                      <label key={def.id} className={`flex items-start gap-3 cursor-pointer p-2 rounded-lg transition-all ${isChecked ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-gray-100'}`}>
                        <div className="relative flex items-center mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => toggleScope(def.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <span className={`text-sm select-none ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {def.item}
                        </span>
                      </label>
                    )})}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 sticky bottom-6 z-20">
             <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-gray-100 flex gap-3">
                 <button type="button" onClick={() => navigate('/')} className="px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition">İptal</button>
                 <button type="submit" disabled={submitting} className="bg-slate-900 text-white px-8 py-2.5 rounded-lg hover:bg-slate-800 font-bold shadow-lg flex items-center gap-2 disabled:opacity-70 transition-all">
                   {submitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                   {id ? 'Değişiklikleri Kaydet' : 'Projeyi Oluştur'}
                 </button>
             </div>
          </div>
       </form>
    </div>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin" /></div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'ADMIN') return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          } />
          <Route path="/admin/components" element={
            <AdminRoute>
              <AdminComponents />
            </AdminRoute>
          } />
          <Route path="/new" element={
            <PrivateRoute>
              <ProjectDefinitionForm />
            </PrivateRoute>
          } />
          <Route path="/edit/:id" element={
            <PrivateRoute>
              <ProjectDefinitionForm />
            </PrivateRoute>
          } />
          <Route path="/project/:id" element={
            <PrivateRoute>
              <ProjectDetails />
            </PrivateRoute>
          } />
          <Route path="/project/:id/plan" element={
            <PrivateRoute>
              <ProjectEffortPlanning />
            </PrivateRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;