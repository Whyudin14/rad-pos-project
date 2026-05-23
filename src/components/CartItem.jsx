function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
      <div className="flex-1">
        <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
        <p className="text-xs text-slate-400">
          Rp {item.price.toLocaleString("id-ID")}
        </p>

        <button
          onClick={() => onRemove(item.id)}
          className="text-xs text-red-500 mt-2 hover:text-red-600"
        >
          Hapus
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onDecrease(item.id)}
          className="h-8 w-8 rounded-xl bg-slate-100 font-bold hover:bg-slate-200"
        >
          -
        </button>

        <span className="w-6 text-center font-semibold">{item.qty}</span>

        <button
          onClick={() => onIncrease(item.id)}
          className="h-8 w-8 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default CartItem