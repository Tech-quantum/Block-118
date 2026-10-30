import { useState } from 'react';

// تولید ۴۰ واحد تستی (۱۰ طبقه × ۴ واحد)
const mockUnits = [];
for (let floor = 1; floor <= 10; floor++) {
  for (let unit = 1; unit <= 4; unit++) {
    mockUnits.push({
      id: `${floor}0${unit}`,
      unitNumber: `${floor}0${unit}`,
      floor: floor,
      owner: null,
      status: 'vacant'
    });
  }
}

export default function App() {
  const [selectedUnit, setSelectedUnit] = useState(null);

  return (
    <div className="min-h-screen pb-10">
      {/* هدر */}
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Block-118 🏢</h1>
          <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">پنل مدیر</span>
        </div>
      </header>

      {/* خلاصه وضعیت */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">کل واحدها</p>
          <p className="text-2xl font-bold text-gray-800">۴۰</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">واحدهای خالی</p>
          <p className="text-2xl font-bold text-orange-500">{mockUnits.filter(u => u.status === 'vacant').length}</p>
        </div>
      </div>

      {/* لیست واحدها */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">لیست واحدها</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mockUnits.map((unit) => (
            <div 
              key={unit.id} 
              onClick={() => setSelectedUnit(unit)}
              className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
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
      </div>

      {/* مودال جزئیات واحد */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedUnit(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 border-b pb-2">جزئیات واحد {selectedUnit.unitNumber}</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-500">طبقه:</span> {selectedUnit.floor}</p>
              <p><span className="text-gray-500">مالک:</span> {selectedUnit.owner || 'ثبت نشده'}</p>
              <p><span className="text-gray-500">وضعیت:</span> {selectedUnit.status === 'vacant' ? 'خالی' : 'ساکن دارد'}</p>
              <p><span className="text-gray-500">بدهی شارژ:</span> ۰ ریال</p>
            </div>
            <button 
              onClick={() => setSelectedUnit(null)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
