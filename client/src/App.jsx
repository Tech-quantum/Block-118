import { useState, useEffect } from 'react';
import { login, logout, watchAuth } from './auth';
import { loadUnits, seedUnits, updateUnit } from './units';

// --- کامپوننت صفحه ورود ---
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError('نام کاربری یا کد ورود اشتباه است.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Block-118 🏢</h1>
          <p className="text-gray-500 text-sm">سامانه مدیریت هوشمند ساختمان</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left font-sans"
              dir="ltr"
              placeholder="مثلا: admin یا 101"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">کد ورود</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left font-sans"
              dir="ltr"
              placeholder="••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition active:scale-95 shadow-md disabled:opacity-60"
          >
            {loading ? 'در حال ورود...' : 'ورود به سیستم'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- کامپوننت اصلی اپلیکیشن ---
export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitsError, setUnitsError] = useState('');
  const [seeding, setSeeding] = useState(false);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ owner: '', status: 'vacant', debt: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = watchAuth((fbUser) => {
      if (fbUser) {
        const name = fbUser.email.split('@')[0];
        setUser(
          name === 'admin'
            ? { role: 'admin', name: 'مدیر ساختمان' }
            : { role: 'resident', name: `ساکن واحد ${name}` }
        );
      } else {
        setUser(null);
        setUnits([]);
      }
      setChecking(false);
    });
    return unsub;
  }, []);

  const fetchUnits = async () => {
    setUnitsLoading(true);
    setUnitsError('');
    try {
      setUnits(await loadUnits());
    } catch (err) {
      setUnitsError('خطا در خواندن اطلاعات: ' + (err.code || err.message));
    }
    setUnitsLoading(false);
  };

  useEffect(() => {
    if (user) fetchUnits();
  }, [user]);

  const handleSeed = async () => {
    setSeeding(true);
    setUnitsError('');
    try {
      await seedUnits();
      await fetchUnits();
    } catch (err) {
      setUnitsError('خطا در ساخت واحدها: ' + (err.code || err.message));
    }
    setSeeding(false);
  };

  const openUnit = (unit) => {
    setSelectedUnit(unit);
    setEditing(false);
    setForm({
      owner: unit.owner || '',
      status: unit.status || 'vacant',
      debt: unit.debt || 0,
    });
  };

  const saveUnit = async () => {
    setSaving(true);
    setUnitsError('');
    try {
      const faDigits = '۰۱۲۳۴۵۶۷۸۹';
      const debtNum =
        Number(
          String(form.debt).replace(/[۰-۹]/g, (d) => faDigits.indexOf(d))
        ) || 0;
      const data = {
        owner: form.owner.trim() || null,
        status: form.status,
        debt: debtNum,
      };
      await updateUnit(selectedUnit.id, data);
      await fetchUnits();
      setSelectedUnit(null);
    } catch (err) {
      setUnitsError('خطا در ذخیره: ' + (err.code || err.message));
    }
    setSaving(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        در حال بارگذاری...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const debtors = units.filter((u) => u.debt > 0);

  return (
    <div className="min-h-screen pb-20 bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Block-118 🏢</h1>
          <p className="text-xs text-blue-200 mt-1">{user.name} خوش آمدید</p>
        </div>
        <button
          onClick={() => logout()}
          className="text-sm bg-blue-700 hover:bg-red-500 transition-colors px-3 py-1.5 rounded-lg border border-blue-500"
        >
          خروج
        </button>
      </header>

      <main className="p-4">
        {unitsError && (
          <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg mb-4">
            {unitsError}
          </p>
        )}

        {/* تب داشبورد */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">کل واحدها</p>
                <p className="text-2xl font-bold text-gray-800">
                  {units.length.toLocaleString('fa-IR')}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">واحدهای بدهکار</p>
                <p className="text-2xl font-bold text-red-500">
                  {debtors.length.toLocaleString('fa-IR')}
                </p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-3">لیست واحدها</h2>

            {unitsLoading && (
              <p className="text-center text-gray-500 py-6">در حال بارگذاری واحدها...</p>
            )}

            {!unitsLoading && units.length === 0 && !unitsError && (
              <div className="bg-white p-6 rounded-xl text-center border border-gray-200">
                <p className="text-gray-600 mb-4">هنوز واحدی ثبت نشده است.</p>
                {user.role === 'admin' ? (
                  <button
                    onClick={handleSeed}
                    disabled={seeding}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-60"
                  >
                    {seeding ? 'در حال ساخت...' : 'ساخت ۴۰ واحد'}
                  </button>
                ) : (
                  <p className="text-sm text-gray-400">با مدیر تماس بگیرید.</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => openUnit(unit)}
                  className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700">واحد {unit.unitNumber}</span>
                    <span className={`text-xs px-2 py-1 rounded-md ${unit.status === 'vacant' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                      {unit.status === 'vacant' ? 'خالی' : 'ساکن دارد'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">طبقه {unit.floor}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* تب شارژها */}
        {activeTab === 'finance' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">وضعیت شارژها</h2>
            {debtors.length === 0 && (
              <p className="text-center text-gray-500 py-6">واحد بدهکاری وجود ندارد.</p>
            )}
            <div className="space-y-3">
              {debtors.map((unit) => (
                <div key={unit.id} className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-red-500 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">واحد {unit.unitNumber}</p>
                    <p className="text-xs text-gray-500 mt-1">بدهی: {unit.debt.toLocaleString()} تومان</p>
                  </div>
                  <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">پرداخت</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تب درخواست‌ها */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">درخواست‌های تعمیرات</h2>
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mb-4 shadow-sm active:bg-blue-700">
              + ثبت درخواست جدید
            </button>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-gray-800">خرابی آسانسور</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">در حال بررسی</span>
              </div>
              <p className="text-sm text-gray-500">واحد ۲۰۱ - ثبت شده در ۲ ساعت پیش</p>
            </div>
          </div>
        )}
      </main>

      {/* مودال جزئیات واحد */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedUnit(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 border-b pb-2">جزئیات واحد {selectedUnit.unitNumber}</h3>

            {!editing ? (
              <div className="space-y-3 text-sm">
                <p><span className="text-gray-500">طبقه:</span> {selectedUnit.floor}</p>
                <p><span className="text-gray-500">مالک:</span> {selectedUnit.owner || 'ثبت نشده'}</p>
                <p><span className="text-gray-500">بدهی:</span> {selectedUnit.debt > 0 ? `${selectedUnit.debt.toLocaleString()} تومان` : 'ندارد'}</p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-gray-500 mb-1">نام مالک</label>
                  <input
                    value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">وضعیت</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="vacant">خالی</option>
                    <option value="occupied">ساکن دارد</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">بدهی (تومان)</label>
                  <input
                    value={form.debt}
                    onChange={(e) => setForm({ ...form, debt: e.target.value })}
                    inputMode="numeric"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              {user.role === 'admin' && !editing && (
                <button onClick={() => setEditing(true)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium">
                  ویرایش
                </button>
              )}
              {editing && (
                <button onClick={saveUnit} disabled={saving} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium disabled:opacity-60">
                  {saving ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
              )}
              <button onClick={() => setSelectedUnit(null)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium">
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* منوی پایین */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 pb-safe z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-xl">🏢</span>
          <span className="text-xs mt-1 font-medium">داشبورد</span>
        </button>
        <button onClick={() => setActiveTab('finance')} className={`flex flex-col items-center p-2 ${activeTab === 'finance' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-xl">💰</span>
          <span className="text-xs mt-1 font-medium">شارژها</span>
        </button>
        <button onClick={() => setActiveTab('requests')} className={`flex flex-col items-center p-2 ${activeTab === 'requests' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-xl">🔧</span>
          <span className="text-xs mt-1 font-medium">درخواست‌ها</span>
        </button>
      </nav>
    </div>
  );
        }
