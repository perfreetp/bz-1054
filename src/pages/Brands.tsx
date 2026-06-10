import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { Sparkles, Cpu, Battery, Camera, Monitor, DollarSign } from 'lucide-react';

export default function Brands() {
  const { brands, models, selectedBrand, setSelectedBrand, theme } = useStore();

  const activeBrand = selectedBrand ?? brands[0]?.id;
  const brandModels = models.filter((m) => m.brandId === activeBrand);
  const newestModel = brandModels.find((m) => m.isNew) || brandModels[0];
  const currentBrand = brands.find((b) => b.id === activeBrand);

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/10';

  const specIcons: Record<string, React.ReactNode> = {
    screen: <Monitor size={18} className="text-cyber-400" />,
    processor: <Cpu size={18} className="text-tech-400" />,
    battery: <Battery size={18} className="text-emerald-400" />,
    camera: <Camera size={18} className="text-accent-400" />,
  };

  const specLabels: Record<string, string> = {
    screen: '屏幕',
    processor: '处理器',
    ram: '内存',
    storage: '存储',
    battery: '电池',
    charging: '充电',
    camera: '后置相机',
    frontCamera: '前置相机',
    weight: '重量',
    os: '系统',
    connectivity: '连接',
  };

  return (
    <div className="space-y-8">
      {/* Brand Navigation */}
      <div className={cn('rounded-2xl p-4 border overflow-x-auto scrollbar-thin', cardBg)}>
        <div className="flex items-center gap-3 min-w-max">
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrand(brand.id)}
              className={cn(
                'flex items-center gap-3 px-6 py-3 rounded-xl transition-all border-2',
                activeBrand === brand.id
                  ? 'border-cyber-500 bg-cyber-500/10 shadow-lg shadow-cyber-500/20'
                  : theme === 'light'
                  ? 'border-transparent hover:bg-slate-100'
                  : 'border-transparent hover:bg-white/5'
              )}
            >
              <span className="text-3xl">{brand.logo}</span>
              <span className={cn('font-semibold whitespace-nowrap', activeBrand === brand.id ? 'gradient-text text-shadow-glow' : theme === 'light' ? 'text-slate-700' : 'text-slate-200')}>
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Newest Model Feature */}
      {newestModel && (
        <section className={cn('rounded-2xl p-8 border', cardBg)}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-accent-500" size={24} />
            <h2 className="text-2xl font-bold">
              {currentBrand?.name} 最新旗舰
            </h2>
            <span className="px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 text-sm font-medium">NEW</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-tech-600/30 to-cyber-500/30 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                <img
                  src={newestModel.image}
                  alt={newestModel.name}
                  className="w-3/4 h-3/4 object-cover rounded-2xl shadow-2xl animate-float"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold mb-2 gradient-text">{newestModel.name}</h3>
                <div className="flex items-center gap-4">
                  <span className={cn('text-3xl font-bold flex items-center gap-1', theme === 'light' ? 'text-slate-800' : 'text-white')}>
                    <DollarSign size={28} className="text-accent-500" />
                    ¥{newestModel.price.toLocaleString()}
                  </span>
                  <span className={cn('text-sm', secondaryText)}>
                    发布于 {newestModel.releaseDate}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(newestModel.specs)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div key={key} className={cn('p-4 rounded-xl border', inputBg)}>
                      <div className="flex items-center gap-2 mb-1">
                        {specIcons[key] || <Cpu size={18} className="text-slate-400" />}
                        <span className={cn('text-sm font-medium', secondaryText)}>
                          {specLabels[key]}
                        </span>
                      </div>
                      <p className={cn('text-sm font-semibold', theme === 'light' ? 'text-slate-800' : 'text-white')}>
                        {value}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {Object.entries(newestModel.ratings).map(([key, value]) => (
                  <div key={key} className={cn('text-center p-3 rounded-xl', inputBg)}>
                    <div className="text-2xl font-bold gradient-text">{value}</div>
                    <div className={cn('text-xs', secondaryText)}>
                      {key === 'performance' ? '性能' : key === 'camera' ? '拍照' : key === 'battery' ? '续航' : key === 'display' ? '屏幕' : key === 'value' ? '性价比' : '设计'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Models */}
      <section className={cn('rounded-2xl p-6 border', cardBg)}>
        <h3 className="text-xl font-bold mb-6">
          {currentBrand?.name} 全部机型
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandModels.map((model) => (
            <div
              key={model.id}
              className={cn(
                'group rounded-2xl p-5 border transition-all hover:-translate-y-1 cursor-pointer',
                inputBg,
                theme === 'light' ? 'hover:shadow-xl hover:shadow-tech-500/10' : 'hover:shadow-xl hover:shadow-cyber-500/20'
              )}
            >
              <div className="aspect-video rounded-xl bg-gradient-to-br from-tech-600/20 to-cyber-500/20 mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-2/3 h-2/3 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
                {model.isNew && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-accent-500 text-white text-xs font-medium">
                    NEW
                  </span>
                )}
              </div>
              <h4 className={cn('font-bold text-lg mb-1 group-hover:text-cyber-400 transition-colors', theme === 'light' ? 'text-slate-800' : 'text-white')}>
                {model.name}
              </h4>
              <p className={cn('text-sm mb-3', secondaryText)}>{model.specs.processor}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-accent-500">¥{model.price.toLocaleString()}</span>
                <span className={cn('text-xs', secondaryText)}>{model.specs.battery}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
