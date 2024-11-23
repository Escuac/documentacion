export const PageTitle = ({title, subtitule, className}) => {
  return (
    <div className={className}>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{subtitule}</p>
    </div>
  )
}
