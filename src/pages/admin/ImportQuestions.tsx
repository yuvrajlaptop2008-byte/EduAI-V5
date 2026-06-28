import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import CsvImportPanel from "../../components/shared/CsvImportPanel";

export default function ImportQuestions() {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2">
        <UploadCloud className="text-brand" size={20} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Import Questions</h1>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-5">Bulk-add questions to the global bank from a CSV file.</p>
      <CsvImportPanel onImported={() => navigate("/admin/questions")} />
    </div>
  );
}
