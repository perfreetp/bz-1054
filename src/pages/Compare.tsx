import { useMemo } from 'react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { Check, X, BarChart3, Star, Plus, Trash2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell,
} from 'recharts';

export default function Compare() {
  const { models, brands, compareModels, toggleCompareModel, clearCompareModels, theme } = useStore();

  const selectedModels = models.filter((m) => compareModels.includes(m.id));

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/10';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';

  const chartColors = ['#06B6D4', '#F97316', '#8B5CF6', '#10B981'];

  const priceData = useMemo(
    () =>
      selectedModels.map((m, i) => ({
        name: m.name.split(' ').slice(-1).join(' '),
        价格: m.price,
        fill: chartColors[i],
      })),
    [selectedModels]
  );

  const radarData = useMemo(() => {
    const dimensions = [
      { key: 'performance', label: '性能' },
      { key: 'camera', label: '拍照' },
      { key: 'battery', label: '续航' },
      { key: 'display', label: '屏幕' },
      { key: 'value', label: '性价比' },
      { key: 'design', label: '设计' },
    ];
    return dimensions.map((dim) => {
      const row: Record<string, string | number> = { dimension: dim.label };
      selectedModels.forEach((m) => {
        row[m.name.split(' ').slice(-1).join(' ')] = m.ratings[dim.key as keyof typeof m.ratings];
      });
      return row;
    });
  }, [selectedModels]);

  const specLabels: Record<string, string> = {
    screen: '屏幕尺寸',
    processor: '处理器',
    ram: '运行内存',
    storage: '存储容量',
    battery: '电池容量',
    charging: '快充功率',
    camera: '后置摄像头',
    frontCamera: '前置摄像头',
    weight: '机身重量',
    os: '操作系统',
    connectivity: '网络连接',
  };

  const allSpecKeys = Object.keys(selectedModels[0]?.specs || {});

  return (
    <div className="space-y-8">
      {/* Model Selection */}
      <section className={cn('rounded-2xl p-6 border', cardBg)}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="text-cyber-400" size={24} />
            选择对比机型
            <span className={cn('text-sm font-normal', secondaryText)}>
              （已选 {compareModels.length}/4）
            </span>
          </h2>
          {compareModels.length > 0 && (
            <button
              onClick={clearCompareModels}
              className={cn('px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all', theme === 'light' ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-500/10')}
            >
              <Trash2 size={16} />
              清空选择
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {models.map((model) => {
            const brand = brands.find((b) => b.id === model.brandId);
            const isSelected = compareModels.includes(model.id);
            const isDisabled = !isSelected && compareModels.length >= 4;
            return (
              <button
                key={model.id}
                onClick={() => toggleCompareModel(model.id)}
                disabled={isDisabled}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all text-left',
                  isSelected
                    ? 'border-cyber-500 bg-cyber-500/10 shadow-lg shadow-cyber-500/20'
                    : isDisabled
                    ? theme === 'light' ? 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed' : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                    : theme === 'light'
                    ? 'border-slate-200 hover:border-tech-400 hover:bg-tech-50'
                    : 'border-white/10 hover:border-cyber-500/50 hover:bg-white/5'
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyber-500 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
                {!isSelected && !isDisabled && (
                  <div className={cn('absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center', theme === 'light' ? 'bg-slate-200' : 'bg-white/10')}>
                    <Plus size={14} className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'} />
                  </div>
                )}
                <div className="text-2xl mb-2">{brand?.logo}</div>
                <div className={cn('font-semibold text-sm truncate', textColor)}>{model.name}</div>
                <div className={cn('text-xs mt-1', secondaryText)}>¥{model.price.toLocaleString()}</div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedModels.length >= 2 && (
        <>
          {/* Price Comparison Chart */}
          <section className={cn('rounded-2xl p-6 border', cardBg)}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="text-accent-500" size={24} />
              价格区间对比
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#334155'} />
                  <XAxis dataKey="name" stroke={theme === 'light' ? '#64748b' : '#94a3b8'} />
                  <YAxis stroke={theme === 'light' ? '#64748b' : '#94a3b8'} tickFormatter={(v) => `¥${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: theme === 'light' ? '#0f172a' : '#fff',
                    }}
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, '价格']}
                  />
                  <Bar dataKey="价格" radius={[8, 8, 0, 0]}>
                    {priceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Ratings Radar Chart */}
          <section className={cn('rounded-2xl p-6 border', cardBg)}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Star className="text-amber-500" size={24} />
              用户评分雷达图
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={theme === 'light' ? '#e2e8f0' : '#334155'} />
                  <PolarAngleAxis dataKey="dimension" stroke={theme === 'light' ? '#64748b' : '#94a3b8'} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} stroke={theme === 'light' ? '#94a3b8' : '#64748b'} />
                  {selectedModels.map((m, i) => (
                    <Radar
                      key={m.id}
                      name={m.name.split(' ').slice(-1).join(' ')}
                      dataKey={m.name.split(' ').slice(-1).join(' ')}
                      stroke={chartColors[i]}
                      fill={chartColors[i]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Specs Comparison Table */}
          <section className={cn('rounded-2xl p-6 border', cardBg)}>
            <h3 className="text-xl font-bold mb-6">详细参数对比</h3>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className={cn('text-left p-4 font-semibold sticky left-0 z-10 w-32', theme === 'light' ? 'bg-slate-50 text-slate-600' : 'bg-slate-800/80 text-slate-300')}>
                      参数项
                    </th>
                    {selectedModels.map((m, i) => (
                      <th key={m.id} className={cn('text-center p-4 font-bold', textColor)} style={{ borderBottom: `3px solid ${chartColors[i]}` }}>
                        <div className="text-lg">{m.name}</div>
                        <div className="text-accent-500 text-base mt-1">¥{m.price.toLocaleString()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allSpecKeys.map((key, rowIdx) => {
                    const values = selectedModels.map((m) => m.specs[key as keyof typeof m.specs]);
                    const allSame = values.every((v) => v === values[0]);
                    return (
                      <tr
                        key={key}
                        className={cn(rowIdx % 2 === 0 ? '' : theme === 'light' ? 'bg-slate-50/50' : 'bg-white/[0.02]')}
                      >
                        <td className={cn('p-4 font-medium sticky left-0 z-10', theme === 'light' ? 'bg-white text-slate-600' : 'bg-slate-900 text-slate-300')}>
                          {specLabels[key] || key}
                        </td>
                        {values.map((val, i) => (
                          <td
                            key={i}
                            className={cn(
                              'p-4 text-center text-sm',
                              allSame
                                ? secondaryText
                                : theme === 'light'
                                ? 'text-slate-800 font-semibold bg-tech-50/50'
                                : 'text-cyber-300 font-semibold bg-cyber-500/10'
                            )}
                          >
                            {typeof val === 'boolean' ? (val ? <Check size={18} className="inline text-emerald-500" /> : <X size={18} className="inline text-red-500" />) : val}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {selectedModels.length < 2 && (
        <div className={cn('rounded-2xl p-16 text-center border', cardBg)}>
          <BarChart3 size={64} className={cn('mx-auto mb-4', secondaryText)} />
          <p className={cn('text-lg', secondaryText)}>请至少选择 2 款机型进行对比</p>
        </div>
      )}
    </div>
  );
}
