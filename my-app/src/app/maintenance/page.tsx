import { FiTool } from 'react-icons/fi';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="text-center max-w-md">
        <FiTool className="mx-auto h-16 w-16 text-sky-400 mb-6" />
        <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          Site en Maintenance
        </h1>
        <p className="text-lg text-gray-300 mb-2">
          Nous effectuons actuellement des mises à jour pour améliorer votre expérience.
        </p>
        <p className="text-lg text-gray-300">
          Le site sera de retour très prochainement. Merci pour votre patience !
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
