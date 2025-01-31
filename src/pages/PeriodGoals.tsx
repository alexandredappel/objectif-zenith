import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PeriodGoals = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Objectifs périodiques</h1>
        <p className="text-gray-600">Gérez vos objectifs à long terme</p>
      </header>

      <main className="max-w-3xl mx-auto">
        <Tabs defaultValue="quarterly" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="quarterly">Trimestriels</TabsTrigger>
            <TabsTrigger value="monthly">Mensuels</TabsTrigger>
            <TabsTrigger value="weekly">Hebdomadaires</TabsTrigger>
          </TabsList>
          <TabsContent value="quarterly" className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Objectifs trimestriels à venir...</p>
          </TabsContent>
          <TabsContent value="monthly" className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Objectifs mensuels à venir...</p>
          </TabsContent>
          <TabsContent value="weekly" className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Objectifs hebdomadaires à venir...</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default PeriodGoals