import React, { useState } from 'react';
import { Building, Upload, Save, User, Lock, Eye, EyeOff, Bell, Mail, MessageSquare, Monitor, FileText, TrendingUp, AlertTriangle, UserCheck, SlidersHorizontal, ShieldCheck, KeyRound, ShieldAlert } from 'lucide-react';

const ToggleSwitch = ({ enabled, setEnabled }) => (
    <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);


const CompanySettings = () => {
    const [companyInfo, setCompanyInfo] = useState({
        name: 'ESA Engineering Works',
        gstin: '29ABCDE1234F1Z5',
        address: '1/100, EB compound, Malumichampatti, Coimbatore - 641050',
        phone: '+91 9843294464',
        email: 'esaengineering@gmail.com',
        website: 'www.gstbillingpro.com'
    });

    const [bankingInfo, setBankingInfo] = useState({
        bankName: 'State Bank of India',
        accountNumber: '1234567890',
        ifsc: 'SBIN0001234',
        upiId: 'gstbillingpro@paytm'
    });

    const handleCompanyChange = (e) => {
        setCompanyInfo({ ...companyInfo, [e.target.name]: e.target.value });
    };

    const handleBankingChange = (e) => {
        setBankingInfo({ ...bankingInfo, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6">
            {/* Company Information Section */}
            <div className="p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                    <Building size={20} className="text-gray-700" />
                    <h2 className="text-lg font-bold text-gray-900">Company Information</h2>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Company Name</label>
                            <input type="text" name="name" value={companyInfo.name} onChange={handleCompanyChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">GSTIN</label>
                            <input type="text" name="gstin" value={companyInfo.gstin} onChange={handleCompanyChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-800 mb-1 block">Address</label>
                        <textarea name="address" value={companyInfo.address} onChange={handleCompanyChange} rows="3" className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Phone Number</label>
                            <input type="text" name="phone" value={companyInfo.phone} onChange={handleCompanyChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Email Address</label>
                            <input type="email" name="email" value={companyInfo.email} onChange={handleCompanyChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-800 mb-1 block">Website</label>
                        <input type="text" name="website" value={companyInfo.website} onChange={handleCompanyChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-800 mb-1 block">Company Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Building size={28} className="text-white"/>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
                                <Upload size={16} />
                                Upload Logo
                            </button>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                            <Save size={16} />
                            Save Company Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Banking Information Section */}
            <div className="p-6 border border-gray-200 rounded-xl">
                 <h2 className="text-lg font-bold text-gray-900 mb-6">Banking Information</h2>
                 <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Bank Name</label>
                            <input type="text" name="bankName" value={bankingInfo.bankName} onChange={handleBankingChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Account Number</label>
                            <input type="text" name="accountNumber" value={bankingInfo.accountNumber} onChange={handleBankingChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">IFSC Code</label>
                            <input type="text" name="ifsc" value={bankingInfo.ifsc} onChange={handleBankingChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">UPI ID</label>
                            <input type="text" name="upiId" value={bankingInfo.upiId} onChange={handleBankingChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                     <div className="pt-2">
                        <button className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600">
                            <Save size={16} />
                            Save Banking Information
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
};

const ProfileSettings = () => {
    const [profileInfo, setProfileInfo] = useState({
        fullName: 'Admin User',
        email: 'admin@company.com',
        phone: '+91 98765 43210',
        role: 'Administrator'
    });
    const [password, setPassword] = useState({ current: '', new: '', confirm: ''});
    const [showPassword, setShowPassword] = useState(false);

    const handleProfileChange = (e) => {
        setProfileInfo({ ...profileInfo, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPassword({ ...password, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6">
            {/* User Profile Section */}
            <div className="p-6 border border-gray-200 rounded-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <User size={20} className="text-gray-700" />
                    <h2 className="text-lg font-bold text-gray-900">User Profile</h2>
                </div>
                <div className="space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            AU
                        </div>
                        <div className="space-y-1">
                             <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
                                <Upload size={16} />
                                Change Photo
                            </button>
                            <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Full Name</label>
                            <input type="text" name="fullName" value={profileInfo.fullName} onChange={handleProfileChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5"/>
                        </div>
                         <div>
                            <label className="text-sm text-gray-800 mb-1 block">Email Address</label>
                            <input type="email" name="email" value={profileInfo.email} onChange={handleProfileChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Phone Number</label>
                            <input type="text" name="phone" value={profileInfo.phone} onChange={handleProfileChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5"/>
                        </div>
                         <div>
                            <label className="text-sm text-gray-800 mb-1 block">Role</label>
                            <input type="text" name="role" value={profileInfo.role} readOnly className="w-full bg-gray-200 border-0 rounded-md text-base p-2.5 text-gray-500"/>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                            <Save size={16} />
                            Update Profile
                        </button>
                    </div>
                </div>
            </div>
            {/* Change Password Section */}
            <div className="p-6 border border-gray-200 rounded-xl">
                 <h2 className="text-lg font-bold text-gray-900 mb-6">Change Password</h2>
                 <div className="space-y-4">
                     <div>
                        <label className="text-sm text-gray-800 mb-1 block">Current Password</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} name="current" value={password.current} onChange={handlePasswordChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5"/>
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">New Password</label>
                            <input type="password" name="new" value={password.new} onChange={handlePasswordChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5"/>
                        </div>
                         <div>
                            <label className="text-sm text-gray-800 mb-1 block">Confirm Password</label>
                            <input type="password" name="confirm" value={password.confirm} onChange={handlePasswordChange} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5"/>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button className="flex items-center gap-2 px-5 py-2 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600">
                            <Lock size={16} />
                            Change Password
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
};

const NotificationsSettings = () => {
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        browser: true,
        invoiceReminders: true,
        paymentAlerts: true,
        overdueAlerts: true,
        newClientAlerts: true,
    });

    const handleToggle = (key) => {
        setNotifications(prev => ({...prev, [key]: !prev[key]}));
    };

    const NotificationItem = ({ icon: Icon, title, description, enabled, onToggle }) => (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Icon size={20} className="text-gray-500"/>
                <div>
                    <h4 className="font-medium text-gray-900">{title}</h4>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <ToggleSwitch enabled={enabled} setEnabled={onToggle} />
        </div>
    );
    
    return (
        <div className="p-6 border border-gray-200 rounded-xl">
             <div className="flex items-center gap-3 mb-6">
                <Bell size={20} className="text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
            </div>
            <div className="space-y-8">
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Notification Channels</h3>
                    <div className="space-y-4">
                        <NotificationItem icon={Mail} title="Email Notifications" description="Receive notifications via email" enabled={notifications.email} onToggle={() => handleToggle('email')} />
                        <NotificationItem icon={MessageSquare} title="SMS Notifications" description="Receive notifications via SMS" enabled={notifications.sms} onToggle={() => handleToggle('sms')} />
                        <NotificationItem icon={Monitor} title="Browser Notifications" description="Show browser notifications" enabled={notifications.browser} onToggle={() => handleToggle('browser')} />
                    </div>
                </div>
                 <div className="border-t border-gray-200 pt-6">
                     <h3 className="text-base font-bold text-gray-800 mb-4">Alert Types</h3>
                      <div className="space-y-4">
                        <NotificationItem icon={FileText} title="Invoice Reminders" description="Get reminded about pending invoices" enabled={notifications.invoiceReminders} onToggle={() => handleToggle('invoiceReminders')} />
                        <NotificationItem icon={TrendingUp} title="Payment Alerts" description="Get notified when payments are received" enabled={notifications.paymentAlerts} onToggle={() => handleToggle('paymentAlerts')} />
                        <NotificationItem icon={AlertTriangle} title="Overdue Alerts" description="Get alerted about overdue payments" enabled={notifications.overdueAlerts} onToggle={() => handleToggle('overdueAlerts')} />
                        <NotificationItem icon={UserCheck} title="New Client Alerts" description="Get notified when new clients are added" enabled={notifications.newClientAlerts} onToggle={() => handleToggle('newClientAlerts')} />
                    </div>
                 </div>
                 <div className="pt-2">
                    <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        <Save size={16} />
                        Save Notification Settings
                    </button>
                </div>
            </div>
        </div>
    )
};

const SystemSettings = () => {
    const [config, setConfig] = useState({
        currency: 'INR',
        timeZone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        invoicePrefix: 'INV'
    });
    const [features, setFeatures] = useState({
        autoInvoice: true,
        gstCalculation: true,
        roundOff: true,
        autoBackup: true
    });

    const FeatureItem = ({ title, description, enabled, onToggle }) => (
        <div className="flex items-center justify-between">
            <div>
                <h4 className="font-medium text-gray-900">{title}</h4>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <ToggleSwitch enabled={enabled} setEnabled={onToggle} />
        </div>
    );

    return (
        <div className="p-6 border border-gray-200 rounded-xl">
             <div className="flex items-center gap-3 mb-6">
                <SlidersHorizontal size={20} className="text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">System Configuration</h2>
            </div>
             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-800 mb-1 block">Default Currency</label>
                        <input type="text" value={config.currency} readOnly className="w-full bg-gray-200 border-0 rounded-md text-base p-2.5 text-gray-500"/>
                    </div>
                    <div>
                        <label className="text-sm text-gray-800 mb-1 block">Time Zone</label>
                        <input type="text" value={config.timeZone} readOnly className="w-full bg-gray-200 border-0 rounded-md text-base p-2.5 text-gray-500"/>
                    </div>
                     <div>
                        <label className="text-sm text-gray-800 mb-1 block">Date Format</label>
                        <input type="text" value={config.dateFormat} readOnly className="w-full bg-gray-200 border-0 rounded-md text-base p-2.5 text-gray-500"/>
                    </div>
                     <div>
                        <label className="text-sm text-gray-800 mb-1 block">Invoice Prefix</label>
                        <input type="text" value={config.invoicePrefix} onChange={(e) => setConfig({...config, invoicePrefix: e.target.value})} className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5"/>
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-bold text-gray-800 mb-4">System Features</h3>
                    <div className="space-y-4">
                       <FeatureItem title="Auto Invoice Numbering" description="Automatically generate sequential invoice numbers" enabled={features.autoInvoice} onToggle={() => setFeatures(p => ({...p, autoInvoice: !p.autoInvoice}))} />
                       <FeatureItem title="GST Calculation" description="Enable automatic GST calculation" enabled={features.gstCalculation} onToggle={() => setFeatures(p => ({...p, gstCalculation: !p.gstCalculation}))} />
                       <FeatureItem title="Round Off" description="Enable automatic round off for invoice totals" enabled={features.roundOff} onToggle={() => setFeatures(p => ({...p, roundOff: !p.roundOff}))} />
                       <FeatureItem title="Auto Backup" description="Automatically backup data daily" enabled={features.autoBackup} onToggle={() => setFeatures(p => ({...p, autoBackup: !p.autoBackup}))} />
                    </div>
                </div>
                 <div className="pt-2">
                    <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        <Save size={16} />
                        Save System Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

const SecuritySettings = () => {
    const [security, setSecurity] = useState({
        loginAlerts: true,
        sessionTimeout: true,
        dataExportAlerts: true,
    });
    
    const SecurityItem = ({ title, description, enabled, onToggle, button }) => (
        <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
            <div>
                 <h4 className="font-medium text-gray-900">{title}</h4>
                 <p className="text-sm text-gray-500">{description}</p>
            </div>
            {button ? button : <ToggleSwitch enabled={enabled} setEnabled={onToggle} />}
        </div>
    );

    return (
        <div className="p-6 border border-gray-200 rounded-xl">
             <div className="flex items-center gap-3 mb-6">
                <ShieldAlert size={20} className="text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>
            </div>
            <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-green-600"/>
                        <p className="font-semibold text-green-700">Security Status: Good</p>
                    </div>
                    <p className="text-sm text-green-600 mt-1">Your account security is up to date. All recommended settings are enabled.</p>
                </div>
                <div className="space-y-4">
                     <SecurityItem 
                        title="Two-Factor Authentication" 
                        description="Add an extra layer of security to your account" 
                        button={<button className="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Enable 2FA</button>}
                    />
                    <SecurityItem 
                        title="Login Alerts" 
                        description="Get notified of new login attempts" 
                        enabled={security.loginAlerts} 
                        onToggle={() => setSecurity(p => ({...p, loginAlerts: !p.loginAlerts}))}
                    />
                    <SecurityItem 
                        title="Session Timeout" 
                        description="Auto-logout after 30 minutes of inactivity" 
                        enabled={security.sessionTimeout} 
                        onToggle={() => setSecurity(p => ({...p, sessionTimeout: !p.sessionTimeout}))}
                    />
                    <SecurityItem 
                        title="Data Export Alerts" 
                        description="Get notified when data is exported" 
                        enabled={security.dataExportAlerts} 
                        onToggle={() => setSecurity(p => ({...p, dataExportAlerts: !p.dataExportAlerts}))}
                    />
                </div>
                 <div className="border-t border-gray-200 pt-6">
                    <button className="px-5 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                        Delete Account
                    </button>
                    <p className="text-sm text-gray-500 mt-2">This action cannot be undone. All your data will be permanently deleted.</p>
                </div>
            </div>
        </div>
    );
};


const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('Company');
    const tabs = ['Company', 'Profile', 'Notifications', 'System', 'Security'];

    
    const renderContent = () => {
        switch (activeTab) {
            case 'Company':
                return <CompanySettings />;
            case 'Profile':
                return <ProfileSettings />;
            case 'Notifications':
                return <NotificationsSettings />;
            case 'System':
                return <SystemSettings />;
            case 'Security':
                return <SecuritySettings />;
            default:
                return <div className="text-center py-20 text-gray-500">Settings for "{activeTab}" are not yet implemented.</div>;
        }
    }

    return (
        <div className="bg-gray-50 p-6 lg:p-16 font-sans">
            <main className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-gray-900">Settings</h1>
                    <p className="text-base text-gray-500">Manage your application preferences and configurations</p>
                </div>
                
                <div className="mb-6">
                    <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1 max-w-max overflow-x-auto">
                        {tabs.map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 text-base rounded-md transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {renderContent()}
            </main>
        </div>
    );
};

export default SettingsPage;

