interface Props {
  value: string
  placeholder: string
  searchLabel: string
  onChange: (v: string) => void
}

export default function SearchBar({ value, placeholder, searchLabel, onChange }: Props) {
  return (
    <div className="search-wrap">
      <div className="search-bar">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button type="button">{searchLabel}</button>
      </div>
    </div>
  )
}
