import { useState } from 'react';

// تولید ۴۰ واحد تستی
const mockUnits = [];
for (let floor = 1; floor <= 10; floor++) {
  for (let unit = 1; unit <= 4; unit++) {
    mockUnits.push({
      id: `${floor}0${unit}`,
      unitNumber: `${floor}0${unit}`,
      floor: floor,
      owner: floor % 3 === 0 ? 'علی رضایی' : null, // چند تا مالک تستی
      status: floor % 3 === 0 ? 'occupied' : 'vacant',
      debt: floor % 2 === 0 ? 1500000 : 0 // چند تا بدهی تستی
    });
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUnit, setSelectedUnit] = useState(null);

  return (
    <div className="min-h-screen pb-20 bg-gray-100"> {/* pb-20 برای اینکه منوی پایین روی کارت‌ها نیفته */}
      
      {/* هدر */}
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Block-118 🏢</h1>
          <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">پنل مدیر</span>
        </div>
      </header>

      {/* محتوای هر تب */}
      <main className="p-4">
        
        {/* تب داشبورد */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">کل واحدها</p>
                <p className="text-2xl font-bold text-gray-800">۴۰</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">واحدهای بدهکار</p>
                <p className="text-2xl font-bold text-red-500">
                  {mockUnits.filter(u => u.debt > 0).length}
                </p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-3">لیست واحدها</h2>
            <div className="grid grid-cols-2 gap-3">
              {mockUnits.map((unit) => (
                <div 
                  key={unit.id} 
                  onClick={() => setSelectedUnit(unit)}
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">وضعیت شارژها (مهر ۱۴۰۴)</h2>
            <div className="space-y-3">
              {mockUnits.filter(u => u.debt > 0).map(unit => (
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
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-500">طبقه:</span> {selectedUnit.floor}</p>
              <p><span className="text-gray-500">مالک:</span> {selectedUnit.owner || 'ثبت نشده'}</p>
              <p><span className="text-gray-500">بدهی:</span> {selectedUnit.debt > 0 ? `${selectedUnit.debt.toLocaleString()} تومان` : 'ندارد'}</p>
            </div>
            <button onClick={() => setSelectedUnit(null)} className="mt-6 w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-medium">بستن</button>
          </div>
        </div>
      )}

      {/* منوی پایین (Bottom Navigation) */}
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
