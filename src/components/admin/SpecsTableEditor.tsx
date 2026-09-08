"use client";

type SpecRow = { key: string; value: string };

type Props = {
  specs: SpecRow[];
  onChange: (index: number, field: "key" | "value", value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

/** Vertical rows: mỗi dòng = Thông số | Giá trị */
export default function SpecsTableEditor({ specs, onChange, onAdd, onRemove }: Props) {
  const rows = specs.length > 0 ? specs : [{ key: "", value: "" }];

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-outline-variant">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-[11px] uppercase tracking-wide text-outline">
              <th className="px-3 py-2.5 text-left font-bold border-b border-r border-outline-variant w-[45%]">
                Thông số
              </th>
              <th className="px-3 py-2.5 text-left font-bold border-b border-outline-variant w-[45%]">
                Giá trị
              </th>
              <th className="px-2 py-2.5 border-b border-outline-variant w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={index} className="border-b border-outline-variant last:border-0">
                <td className="p-1.5 border-r border-outline-variant">
                  <input
                    type="text"
                    placeholder="Vd: Công suất"
                    value={item.key}
                    onChange={(e) => onChange(index, "key", e.target.value)}
                    className="w-full bg-surface-container-low border border-transparent focus:border-primary rounded-lg px-2.5 py-2 outline-none text-sm"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    type="text"
                    placeholder="Vd: 10kW"
                    value={item.value}
                    onChange={(e) => onChange(index, "value", e.target.value)}
                    className="w-full bg-surface-container-low border border-transparent focus:border-primary rounded-lg px-2.5 py-2 outline-none text-sm font-semibold text-on-surface"
                  />
                </td>
                <td className="p-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    title="Xóa dòng"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Thêm dòng thông số
      </button>
    </div>
  );
}
