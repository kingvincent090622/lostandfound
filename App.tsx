
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Item, Category, User, ItemStatus, UserRole, Page } from './types';
import { ITEMS, CATEGORIES, USERS } from './constants';
import { generateDescription } from './services/geminiService';
import { SearchIcon, SunIcon, MoonIcon, SparklesIcon, DashboardIcon, ListBulletIcon, TagIcon } from './components/Icons';
import DashboardChart from './components/DashboardChart';

// --- Helper Functions ---
const getStatusClass = (status: ItemStatus) => {
  switch (status) {
    case ItemStatus.Lost:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case ItemStatus.Found:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case ItemStatus.Claimed:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// --- Main App Component ---
export default function App() {
  const [items, setItems] = useState<Item[]>(ITEMS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [currentUser, setCurrentUser] = useState<User>(USERS[1]); // Default to regular user
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (role: UserRole) => {
    const user = USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setCurrentPage(role === UserRole.Admin ? Page.AdminDashboard : Page.Home);
    }
  };

  const handleLogout = () => {
    setCurrentUser(USERS[1]); // Revert to a default user
    setCurrentPage(Page.Home);
  };

  const addItem = (item: Omit<Item, 'id'>) => {
    setItems(prev => [...prev, { ...item, id: Date.now() }]);
    setCurrentPage(Page.Home);
  };

  const updateItemStatus = (itemId: number, status: ItemStatus) => {
    setItems(items.map(item => item.id === itemId ? { ...item, status } : item));
  };
  
  const addCategory = (name: string) => {
    if (name && !categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      const newCategory: Category = { id: Date.now(), name };
      setCategories([...categories, newCategory]);
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(item =>
        filterCategory ? item.categoryId === parseInt(filterCategory) : true
      )
      .sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());
  }, [items, searchTerm, filterCategory]);

  const renderContent = () => {
    switch (currentPage) {
      case Page.Report:
        return <ReportItemForm categories={categories} currentUser={currentUser} onAddItem={addItem} />;
      case Page.AdminDashboard:
        return <AdminDashboard items={items} categories={categories} users={USERS} />;
      case Page.AdminItems:
        return <AdminItemManagement items={filteredItems} onStatusChange={updateItemStatus} />;
      case Page.AdminCategories:
        return <AdminCategoryManagement categories={categories} onAddCategory={addCategory} />;
      case Page.Home:
      default:
        return (
          <HomePage
            items={filteredItems}
            categories={categories}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            onReportClick={() => setCurrentPage(Page.Report)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300">
      <Header
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        setCurrentPage={setCurrentPage}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {currentUser.role === UserRole.Admin && currentPage !== Page.Home && (
          <AdminNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

// --- Layout Components ---

interface HeaderProps {
  currentUser: User;
  onLogin: (role: UserRole) => void;
  onLogout: () => void;
  setCurrentPage: (page: Page) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}
const Header: React.FC<HeaderProps> = ({ currentUser, onLogin, onLogout, setCurrentPage, isDarkMode, toggleDarkMode }) => (
  <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 cursor-pointer" onClick={() => setCurrentPage(Page.Home)}>
          Lost & Found
        </h1>
        <div className="flex items-center space-x-4">
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
          <div className="flex items-center space-x-2 text-sm">
            <span>Welcome, {currentUser.name}</span>
            <span className="text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 font-medium px-2 py-0.5 rounded-full">{currentUser.role}</span>
          </div>
          {currentUser.role === UserRole.Admin ? (
            <button onClick={() => setCurrentPage(Page.AdminDashboard)} className="hidden sm:inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              Admin Panel
            </button>
          ) : null}
          <div className="relative group">
            <button className="px-3 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700">
              Switch User
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
                <a onClick={() => onLogin(UserRole.User)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">Login as User</a>
                <a onClick={() => onLogin(UserRole.Admin)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">Login as Admin</a>
                <a onClick={onLogout} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const Footer: React.FC = () => (
    <footer className="bg-white dark:bg-gray-800 mt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Gemini Lost & Found. All rights reserved.</p>
        </div>
    </footer>
);


// --- Page Components ---

interface HomePageProps {
  items: Item[];
  categories: Category[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  onReportClick: () => void;
}
const HomePage: React.FC<HomePageProps> = ({ items, categories, searchTerm, setSearchTerm, filterCategory, setFilterCategory, onReportClick }) => (
  <div>
    <div className="text-center my-8">
      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">Find What's Lost, Report What's Found</h2>
      <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Your community platform for reuniting people with their belongings.</p>
    </div>

    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 sticky top-[81px] z-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="relative md:col-span-1">
          <input
            type="text"
            placeholder="Search by item, description, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="md:col-span-1">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1">
          <button onClick={onReportClick} className="w-full bg-primary-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-primary-700 transition-colors">
            Report an Item
          </button>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.length > 0 ? items.map(item => (
        <ItemCard key={item.id} item={item} categories={categories} />
      )) : (
        <p className="col-span-full text-center text-gray-500 dark:text-gray-400">No items found. Try adjusting your search or filters.</p>
      )}
    </div>
  </div>
);

interface ItemCardProps {
  item: Item;
  categories: Category[];
}
const ItemCard: React.FC<ItemCardProps> = ({ item, categories }) => {
  const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Unknown';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      {item.image && (
        <img src={item.image} alt={item.itemName} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusClass(item.status)}`}>
              {item.status}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{item.dateReported}</span>
        </div>
        <h3 className="text-xl font-bold mt-2 truncate">{item.itemName}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Category: {categoryName}</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Location: {item.location}</p>
        <p className="text-gray-700 dark:text-gray-300 mt-4 text-sm h-20 overflow-y-auto">{item.description}</p>
        <button className="w-full mt-4 bg-primary-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-primary-600 transition-colors text-sm">
          Contact Reporter
        </button>
      </div>
    </div>
  );
};

interface ReportItemFormProps {
  categories: Category[];
  currentUser: User;
  onAddItem: (item: Omit<Item, 'id'>) => void;
}
const ReportItemForm: React.FC<ReportItemFormProps> = ({ categories, currentUser, onAddItem }) => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id.toString() || '');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ItemStatus>(ItemStatus.Found);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerateDescription = async () => {
    if (!itemName || !categoryId || !location) {
        alert('Please fill in Item Name, Category, and Location first.');
        return;
    }
    setIsGenerating(true);
    const categoryName = categories.find(c => c.id === parseInt(categoryId))?.name || 'general';
    const generatedDesc = await generateDescription(itemName, categoryName, location);
    setDescription(generatedDesc);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem({
      itemName,
      description,
      categoryId: parseInt(categoryId),
      location,
      status,
      dateReported: new Date().toISOString().split('T')[0],
      image: imagePreview,
      userId: currentUser.id
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Report a Lost or Found Item</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Item Name</label>
          <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
          <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="mt-2 flex items-center justify-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 disabled:opacity-50 disabled:cursor-not-allowed">
            <SparklesIcon className="w-4 h-4 mr-1" />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <div className="flex space-x-4">
            <label className="flex items-center"><input type="radio" value={ItemStatus.Lost} checked={status === ItemStatus.Lost} onChange={() => setStatus(ItemStatus.Lost)} className="mr-2" /> Lost</label>
            <label className="flex items-center"><input type="radio" value={ItemStatus.Found} checked={status === ItemStatus.Found} onChange={() => setStatus(ItemStatus.Found)} className="mr-2" /> Found</label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image (Optional)</label>
          <input type="file" onChange={handleImageChange} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/50 dark:file:text-primary-300 dark:hover:file:bg-primary-900"/>
          {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 rounded-md max-h-40" />}
        </div>
        <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-700 transition-colors">Submit Report</button>
      </form>
    </div>
  );
};


// --- Admin Components ---
interface AdminNavProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}
const AdminNav: React.FC<AdminNavProps> = ({ currentPage, setCurrentPage }) => {
    const navItems = [
        { page: Page.AdminDashboard, label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5 mr-3"/> },
        { page: Page.AdminItems, label: 'Items', icon: <ListBulletIcon className="w-5 h-5 mr-3"/> },
        { page: Page.AdminCategories, label: 'Categories', icon: <TagIcon className="w-5 h-5 mr-3"/> },
    ];

    return (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <nav className="flex space-x-1 p-1">
                {navItems.map(item => (
                    <button
                        key={item.label}
                        onClick={() => setCurrentPage(item.page)}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === item.page
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};


interface AdminDashboardProps {
  items: Item[];
  categories: Category[];
  users: User[];
}
const AdminDashboard: React.FC<AdminDashboardProps> = ({ items, categories, users }) => {
  const totalItems = items.length;
  const lostItems = items.filter(i => i.status === ItemStatus.Lost).length;
  const foundItems = items.filter(i => i.status === ItemStatus.Found).length;
  const claimedItems = items.filter(i => i.status === ItemStatus.Claimed).length;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Items" value={totalItems} />
        <StatCard title="Lost Items" value={lostItems} color="red" />
        <StatCard title="Found Items" value={foundItems} color="green" />
        <StatCard title="Claimed Items" value={claimedItems} color="blue" />
      </div>
      <div>
        <DashboardChart items={items} categories={categories} />
      </div>
    </div>
  );
};

interface StatCardProps {
    title: string;
    value: number | string;
    color?: 'red' | 'green' | 'blue';
}
const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
    const colorClasses = {
        red: 'border-red-500',
        green: 'border-green-500',
        blue: 'border-blue-500',
        default: 'border-primary-500',
    };
    const selectedColor = color ? colorClasses[color] : colorClasses.default;

    return (
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 ${selectedColor}`}>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</h4>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
    );
}

interface AdminItemManagementProps {
  items: Item[];
  onStatusChange: (itemId: number, status: ItemStatus) => void;
}
const AdminItemManagement: React.FC<AdminItemManagementProps> = ({ items, onStatusChange }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">Manage Items</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Item Name</th>
            <th scope="col" className="px-6 py-3">Location</th>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td className="px-6 py-4 font-medium">{item.itemName}</td>
              <td className="px-6 py-4">{item.location}</td>
              <td className="px-6 py-4">{item.dateReported}</td>
              <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClass(item.status)}`}>{item.status}</span>
              </td>
              <td className="px-6 py-4">
                <select 
                  value={item.status} 
                  onChange={(e) => onStatusChange(item.id, e.target.value as ItemStatus)}
                  className="p-1 border rounded-md text-xs dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={ItemStatus.Lost}>Lost</option>
                  <option value={ItemStatus.Found}>Found</option>
                  <option value={ItemStatus.Claimed}>Claimed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

interface AdminCategoryManagementProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
}
const AdminCategoryManagement: React.FC<AdminCategoryManagementProps> = ({ categories, onAddCategory }) => {
  const [newCategory, setNewCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCategory(newCategory);
    setNewCategory('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>
      <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
        <input 
          type="text" 
          value={newCategory} 
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        <button type="submit" className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-primary-700">Add</button>
      </form>
      <ul className="space-y-2">
        {categories.map(cat => (
          <li key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <span>{cat.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
