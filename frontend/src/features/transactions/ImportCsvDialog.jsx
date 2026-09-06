import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle, FileUp, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useTransactions } from '@/hooks/useTransactions';
import { getApiErrorMessage } from '@/utils/apiError';
import client from '@/api/client';

async function importCsvRequest(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await client.post('/transactions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export default function ImportCsvDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const { fetch } = useTransactions(false);
  const confirm = useConfirm();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); }
  };

  const handleImport = async () => {
    if (!file) return;
    const ok = await confirm({
      title: 'Import transactions?',
      description: `Import transactions from "${file.name}"?`,
      confirmLabel: 'Import',
    });
    if (!ok) return;
    setLoading(true);
    try {
      const data = await importCsvRequest(file);
      setResult(data);
      if (data.imported > 0) {
        toast.success(`${data.imported} transaction${data.imported !== 1 ? 's' : ''} imported`);
        fetch();
      } else {
        toast.error('No transactions were imported');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Import failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4" />Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Import transactions from CSV</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-border bg-surface-2/50 p-3 text-center">
            <p className="text-xs font-semibold text-foreground">Required columns</p>
            <code className="mt-1 block text-xs text-muted">date, type, category, description, amount</code>
            <p className="mt-1 text-xs text-muted">date: YYYY-MM-DD or DD/MM/YYYY · type: income / expense</p>
          </div>

          <button
            type="button"
            className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <FileUp className="h-8 w-8 text-muted" />
            <p className="text-sm font-medium text-foreground">
              {file ? file.name : 'Click to select a CSV file'}
            </p>
            {file && <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>}
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </button>

          {result && (
            <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{result.imported} transaction{result.imported !== 1 ? 's' : ''} imported</span>
              </div>
              {result.errors?.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 text-warning">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {result.errors.length} row{result.errors.length !== 1 ? 's' : ''} skipped
                  </p>
                  <ul className="mt-1 max-h-24 overflow-y-auto space-y-0.5 text-xs text-muted">
                    {result.errors.map((e) => (
                      <li key={e.row}>Row {e.row}: {e.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>Close</Button>
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? 'Importing…' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
