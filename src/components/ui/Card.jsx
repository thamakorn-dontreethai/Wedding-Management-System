import '../../index.css';
const Card = ({ title, children, footer, price, capacity }) => (
  <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-rose-200 cursor-pointer group">
    <div className="absolute inset-0 bg-gradient-to-br from-rose-50/0 via-rose-50/0 to-amber-50/0 group-hover:from-rose-50/40 group-hover:to-amber-50/30 transition-all pointer-events-none" />
    <div className="relative p-6 border-b border-slate-100">
      <h3 className="font-semibold text-lg text-slate-900 tracking-tight group-hover:text-rose-700 transition-colors">{title}</h3>
    </div>
    <div className="relative p-6 space-y-4">
      {children && <div className="text-slate-600 leading-relaxed">{children}</div>}
      {(price || capacity) && (
        <div className="space-y-2">
          {price && <div className="text-2xl font-bold text-rose-600">{price}</div>}
          {capacity && <div className="text-sm text-slate-500">Capacity: {capacity}</div>}
        </div>
      )}
    </div>
    {footer && (
      <div className="relative p-4 bg-gradient-to-r from-slate-50 to-transparent border-t border-slate-100 group-hover:from-rose-50/70 transition-all">
        {footer}
      </div>
    )}
  </div>
);
export default Card;