import React, { useState, useRef, useEffect, useContext } from 'react';
// Added 'Clock' to the import list for the new session timeout display
import { Building, Upload, Save, User, Lock, Eye, EyeOff, Bell, Mail, MessageSquare, Monitor, FileText, TrendingUp, AlertTriangle, UserCheck, SlidersHorizontal, ShieldCheck, ShieldAlert, LogOut, Package, Clock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

// A reusable toggle switch component
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
    });

    const [bankingInfo, setBankingInfo] = useState({
        bankName: 'State Bank of India',
        accountNumber: '1234567890',
        ifsc: 'SBIN0001234',
        upiId: 'gstbillingpro@paytm'
    });
    
    // State for logo upload preview
    const [logoPreview, setLogoPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleCompanyChange = (e) => {
        setCompanyInfo({ ...companyInfo, [e.target.name]: e.target.value });
    };

    const handleBankingChange = (e) => {
        setBankingInfo({ ...bankingInfo, [e.target.name]: e.target.value });
    };
    
    // Handler for logo file selection
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveCompany = () => {
        console.log("Saving Company Info:", companyInfo);
        if (logoPreview) {
             console.log("Logo is ready for upload.");
        }
        alert("Company settings saved! (Placeholder)");
    };
    
    const handleSaveBanking = () => {
        console.log("Saving Banking Info:", bankingInfo);
        alert("Banking information saved! (Placeholder)");
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
                            <input type="text" name="name" value={companyInfo.name} onChange={handleCompanyChange} className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">GSTIN</label>
                            <input type="text" name="gstin" value={companyInfo.gstin} onChange={handleCompanyChange} className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-800 mb-1 block">Address</label>
                        <textarea name="address" value={companyInfo.address} onChange={handleCompanyChange} rows="3" className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Phone Number</label>
                            <input type="text" name="phone" value={companyInfo.phone} onChange={handleCompanyChange} className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Email Address</label>
                            <input type="email" name="email" value={companyInfo.email} onChange={handleCompanyChange} className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-800 mb-1 block">Company Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-100 border rounded-lg flex items-center justify-center overflow-hidden">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Building size={28} className="text-gray-400"/>
                                )}
                            </div>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} className="hidden" />
                            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
                                <Upload size={16} />
                                Upload Logo
                            </button>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button onClick={handleSaveCompany} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
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
                            <input type="text" name="bankName" value={bankingInfo.bankName} onChange={handleBankingChange} className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Account Number</label>
                            <input type="text" name="accountNumber" value={bankingInfo.accountNumber} onChange={handleBankingChange} className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">IFSC Code</label>
                            <input type="text" name="ifsc" value={bankingInfo.ifsc} onChange={handleBankingChange} className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">UPI ID</label>
                            <input type="text" name="upiId" value={bankingInfo.upiId} onChange={handleBankingChange} className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                     <div className="pt-2">
                        <button onClick={handleSaveBanking} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
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
    const { user, updateUserEmail, updateUserPassword, updateUserProfile } = useContext(AuthContext);
    const [profileInfo, setProfileInfo] = useState({
        fullName: '',
        email: '',
        phone: '+91 98765 43210',
        role: 'Administrator'
    });
    const [password, setPassword] = useState({ current: '', new: '', confirm: ''});
    const [showPassword, setShowPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (user) {
            setProfileInfo(prev => ({
                ...prev,
                fullName: user.displayName || 'Admin User',
                email: user.email || '',
                phone: user.phoneNumber || '+91 98765 43210',
                role: user.role || 'Administrator'
            }));
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileInfo({ ...profileInfo, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPassword({ ...password, [e.target.name]: e.target.value });
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        setMessage({ text: '', type: '' });
    };

    const handleSaveProfile = async () => {
        if (!profileInfo.email) {
            setMessage({ text: 'Email cannot be empty', type: 'error' });
            return;
        }
        
        setIsUpdating(true);
        setMessage({ text: 'Updating profile...', type: 'info' });
        
        try {
            // Update display name if it has changed
            if (profileInfo.fullName !== user.displayName) {
                const nameResult = await updateUserProfile(profileInfo.fullName);
                if (!nameResult.success) {
                    throw new Error(nameResult.error || 'Failed to update name');
                }
            }
            
            // Only update email if it has changed
            if (profileInfo.email !== user.email) {
                const emailResult = await updateUserEmail(profileInfo.email, password.current);
                if (!emailResult.success) {
                    throw new Error(emailResult.error || 'Failed to update email');
                }
            }
            
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setIsEditing(false);
            setPassword(prev => ({ ...prev, current: '' }));
            
            // Clear the message after 3 seconds
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ 
                text: error.message || 'Failed to update profile. Please check your current password and try again.', 
                type: 'error' 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (password.new !== password.confirm) {
            setMessage({ text: 'New password and confirm password do not match.', type: 'error' });
            return;
        }
        if (password.new.length < 6) {
            setMessage({ text: 'Password should be at least 6 characters long.', type: 'error' });
            return;
        }
        
        setIsUpdating(true);
        setMessage({ text: 'Updating password...', type: 'info' });
        
        try {
            const result = await updateUserPassword(password.current, password.new);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update password');
            }
            
            setMessage({ text: 'Password updated successfully!', type: 'success' });
            setPassword({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage({ 
                text: error.message || 'Failed to update password. Please check your current password and try again.', 
                type: 'error' 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Message Display */}
            {message.text && (
                <div className={`p-4 rounded-md ${
                    message.type === 'error' ? 'bg-red-50 text-red-700' : 
                    message.type === 'success' ? 'bg-green-50 text-green-700' :
                    'bg-blue-50 text-blue-700'
                }`}>
                    {message.text}
                </div>
            )}

            {/* User Profile Section */}
            <div className="p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <User size={20} className="text-gray-700" />
                        <h2 className="text-lg font-bold text-gray-900">User Profile</h2>
                    </div>
                    {!isEditing ? (
                        <button 
                            onClick={toggleEdit}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                onClick={toggleEdit}
                                className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveProfile}
                                disabled={isUpdating}
                                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            {profileInfo.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="space-y-1">
                            <button 
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                                disabled={isUpdating}
                            >
                                <Upload size={16} />
                                Change Photo
                            </button>
                            <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Full Name</label>
                            <input 
                                type="text" 
                                name="fullName" 
                                value={profileInfo.fullName} 
                                onChange={handleProfileChange} 
                                className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 disabled:bg-gray-200 disabled:text-gray-500"
                                disabled={!isEditing || isUpdating}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Email Address</label>
                            {isEditing ? (
                                <>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={profileInfo.email} 
                                        onChange={handleProfileChange} 
                                        className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 disabled:bg-gray-200 disabled:text-gray-500"
                                        disabled={isUpdating}
                                    />
                                    <div className="mt-2">
                                        <label className="text-sm text-gray-800 mb-1 block">Confirm Current Password</label>
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            name="current" 
                                            value={password.current} 
                                            onChange={handlePasswordChange} 
                                            placeholder="Required to update email"
                                            className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5"
                                            disabled={isUpdating}
                                        />
                                    </div>
                                </>
                            ) : (
                                <input 
                                    type="email" 
                                    value={profileInfo.email} 
                                    readOnly 
                                    className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 text-gray-700"
                                />
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Phone Number</label>
                            <input 
                                type="text" 
                                name="phone" 
                                value={profileInfo.phone} 
                                onChange={handleProfileChange} 
                                className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 disabled:bg-gray-200 disabled:text-gray-500"
                                disabled={!isEditing || isUpdating}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Role</label>
                            <input 
                                type="text" 
                                value={profileInfo.role} 
                                readOnly 
                                className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 text-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Change Password Section */}
            <div className="p-6 border border-gray-200 rounded-xl">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Change Password</h2>
                <div className="space-y-4 max-w-lg">
                    <div>
                        <label className="text-sm text-gray-800 mb-1 block">Current Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                name="current" 
                                value={password.current} 
                                onChange={handlePasswordChange} 
                                className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 pr-10"
                                disabled={isUpdating}
                                placeholder="Enter your current password"
                            />
                            <button 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                type="button"
                                disabled={isUpdating}
                            >
                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">New Password</label>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                name="new" 
                                value={password.new} 
                                onChange={handlePasswordChange} 
                                className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5"
                                disabled={isUpdating}
                                placeholder="At least 6 characters"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Confirm Password</label>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                name="confirm" 
                                value={password.confirm} 
                                onChange={handlePasswordChange} 
                                className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5"
                                disabled={isUpdating}
                                placeholder="Retype new password"
                            />
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <button 
                            onClick={handlePasswordUpdate} 
                            disabled={isUpdating || !password.current || !password.new || !password.confirm}
                            className={`flex items-center gap-2 px-5 py-2 text-white rounded-md text-sm font-medium ${
                                isUpdating || !password.current || !password.new || !password.confirm 
                                    ? 'bg-blue-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isUpdating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} />
                                    Change Password
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationsSettings = () => {
    const [notifications, setNotifications] = useState({
        paymentAlerts: true, overdueAlerts: true, newClientAlerts: true, newProductAlerts: true,
    });

    const handleToggle = (key) => {
        setNotifications(prev => ({...prev, [key]: !prev[key]}));
    };

    const NotificationItem = ({ icon: Icon, title, description, enabled, onToggle }) => (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Icon size={20} className="text-gray-500"/>
                <div>
                    <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
            <ToggleSwitch enabled={enabled} setEnabled={onToggle} />
        </div>
    );
    
    return (
        <div className="p-6 border border-gray-200 rounded-xl">
             <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Bell size={20} className="text-gray-700" />
                        <h2 className="text-lg font-bold text-gray-900">Notification Settings</h2>
                    </div>
                     <div className="space-y-4">
                        <NotificationItem icon={TrendingUp} title="Payment Alerts" description="Get notified when payments are received" enabled={notifications.paymentAlerts} onToggle={() => handleToggle('paymentAlerts')} />
                        <NotificationItem icon={AlertTriangle} title="Overdue Alerts" description="Get alerted about overdue payments" enabled={notifications.overdueAlerts} onToggle={() => handleToggle('overdueAlerts')} />
                        <NotificationItem icon={UserCheck} title="New Client Alerts" description="Get notified when new clients are added" enabled={notifications.newClientAlerts} onToggle={() => handleToggle('newClientAlerts')} />
                        <NotificationItem icon={Package} title="New Product Alerts" description="Get notified when new products are added" enabled={notifications.newProductAlerts} onToggle={() => handleToggle('newProductAlerts')} />
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
    const [config, setConfig] = useState({ currency: 'INR', timeZone: 'Asia/Kolkata', dateFormat: 'DD/MM/YYYY', invoicePrefix: 'INV' });
    const [features, setFeatures] = useState({ autoInvoice: true, gstCalculation: true, roundOff: true });

    const FeatureItem = ({ title, description, enabled, onToggle }) => (
        <div className="flex items-center justify-between">
            <div>
                <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
                <p className="text-xs text-gray-500">{description}</p>
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
                        <input type="text" value={config.currency} readOnly className="w-full bg-gray-200 border-0 rounded-md text-sm p-2.5 text-gray-500"/>
                    </div>
                    <div>
                        <label className="text-sm text-gray-800 mb-1 block">Time Zone</label>
                        <input type="text" value={config.timeZone} readOnly className="w-full bg-gray-200 border-0 rounded-md text-sm p-2.5 text-gray-500"/>
                    </div>
                     <div>
                        <label className="text-sm text-gray-800 mb-1 block">Date Format</label>
                        <input type="text" value={config.dateFormat} readOnly className="w-full bg-gray-200 border-0 rounded-md text-sm p-2.5 text-gray-500"/>
                    </div>
                     <div>
                        <label className="text-sm text-gray-800 mb-1 block">Invoice Prefix</label>
                        <input type="text" value={config.invoicePrefix} onChange={(e) => setConfig({...config, invoicePrefix: e.target.value})} className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5"/>
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-bold text-gray-800 mb-4">System Features</h3>
                    <div className="space-y-4">
                       <FeatureItem title="Auto Invoice Numbering" description="Automatically generate sequential invoice numbers" enabled={features.autoInvoice} onToggle={() => setFeatures(p => ({...p, autoInvoice: !p.autoInvoice}))} />
                       <FeatureItem title="GST Calculation" description="Enable automatic GST calculation" enabled={features.gstCalculation} onToggle={() => setFeatures(p => ({...p, gstCalculation: !p.gstCalculation}))} />
                       <FeatureItem title="Round Off" description="Enable automatic round off for invoice totals" enabled={features.roundOff} onToggle={() => setFeatures(p => ({...p, roundOff: !p.roundOff}))} />
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
    // ✅ UPDATED: Get the new state and function from the context
    const { signOut, isSessionTimeoutEnabled, toggleSessionTimeout } = useContext(AuthContext);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const handleLogout = async () => {
        try {
            await signOut();
            // The AuthContext will handle the redirection
        } catch (error) {
            console.error('Error during logout:', error);
            setMessage({
                text: 'Failed to log out. Please try again.',
                type: 'error'
            });
        }
    };

    // ✅ UPDATED: A more flexible SecurityItem that can accept any UI control
    const SecurityItem = ({ icon: Icon, title, description, control }) => (
        <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <Icon size={20} className="text-gray-500" />
                 <div>
                    <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
                    <p className="text-xs text-gray-500">{description}</p>
                 </div>
            </div>
            {/* This will render our toggle switch */}
            {control && <div>{control}</div>}
        </div>
    );

    return (
        <div className="p-6 border border-gray-200 rounded-xl">
             <div className="flex items-center gap-3 mb-6">
                <ShieldAlert size={20} className="text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>
            </div>
            <div className="space-y-6">
                 {message.text && (
                     <div className={`p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : ''}`}>
                         {message.text}
                     </div>
                 )}
                <div className="space-y-4">
                    {/* ✅ UPDATED: The SecurityItem now renders a ToggleSwitch */}
                    <SecurityItem 
                        icon={Clock}
                        title="Session Timeout" 
                        description="Automatically log out after 15 minutes of inactivity." 
                        control={
                            <ToggleSwitch
                                enabled={isSessionTimeoutEnabled}
                                setEnabled={toggleSessionTimeout}
                            />
                        }
                    />
                </div>
                 <div className="border-t border-gray-200 pt-6">
                    <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700">
                        <LogOut size={16} />
                        Logout
                    </button>
                    <p className="text-sm text-gray-500 mt-2">You will be returned to the login screen.</p>
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
        // LAYOUT CHANGE: Applying consistent page structure
        <div className="min-h-screen bg-white font-sans">
            <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
                <header>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your application preferences and configurations</p>
                </header>
                
                <main className="mt-8">
                    <div className="mb-6">
                        <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1 max-w-max overflow-x-auto">
                            {tabs.map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    // FONT/STYLE CHANGE: Added font-medium
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;