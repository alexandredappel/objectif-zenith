const Calendar = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calendrier</h1>
        <p className="text-gray-600">Vue d'ensemble de vos objectifs</p>
      </header>

      <main className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Calendrier à venir...</p>
        </div>
      </main>
    </div>
  )
}

export default Calendar