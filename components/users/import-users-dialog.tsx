"use client";

import { DownloadIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRefreshUsers } from "@/hooks/use-users";
import {
  toastApiError,
  toastFormError,
  userApi,
  type ImportErrorCode,
  type ImportRowError,
  type UserImportResponse,
} from "@/lib/api";
import { IMPORT_MAX_BYTES } from "@/lib/validations/users";

const TEMPLATE_PATH = "/templates/mau-nhap-hoc-sinh.xlsx";

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  fullName: "Họ và tên",
  phone: "Số điện thoại",
  dateOfBirth: "Ngày sinh",
  gender: "Giới tính",
  school: "Trường",
  grade: "Lớp",
  guardian: "Người giám hộ",
  guardianFullName: "Họ tên người giám hộ",
  guardianPhone: "SĐT người giám hộ",
  guardianRelationship: "Quan hệ với học sinh",
};

const ERROR_LABELS: Record<ImportErrorCode, string> = {
  REQUIRED: "chưa nhập",
  INVALID_FORMAT: "sai định dạng",
  TOO_LONG: "quá dài",
  DUPLICATE_IN_FILE: "trùng với dòng khác trong file",
  EMAIL_ALREADY_REGISTERED: "đã được đăng ký",
  GUARDIAN_REQUIRED: "cần đủ họ tên, số điện thoại và địa chỉ",
};

interface ImportUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportUsersDialog({
  open,
  onOpenChange,
}: ImportUsersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Nhập học sinh từ Excel"
        description="Học sinh nhận email hướng dẫn dùng “Quên mật khẩu” để tự đặt mật khẩu."
        className="max-w-140"
      >
        <ImportForm onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ImportForm({ onDone }: { onDone: () => void }) {
  const refreshUsers = useRefreshUsers();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<UserImportResponse | null>(null);
  const [pending, setPending] = useState(false);

  const checkFile = async (selected: File) => {
    setFile(null);
    setReport(null);
    if (selected.size > IMPORT_MAX_BYTES) {
      toastFormError("File vượt quá 2 MB");
      return;
    }
    setPending(true);
    try {
      setReport(await userApi.importStudents(selected, true));
      setFile(selected);
    } catch (error) {
      toastApiError(error);
    } finally {
      setPending(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    // Cho phép chọn lại đúng file đó sau khi đã sửa nội dung.
    event.target.value = "";
    if (selected) void checkFile(selected);
  };

  const handleImport = async () => {
    if (!file) return;
    setPending(true);
    try {
      const result = await userApi.importStudents(file, false);
      // File có thể đã cũ so với lần kiểm tra, ví dụ email vừa được đăng ký.
      if (result.errors.length > 0) {
        setReport(result);
        return;
      }
      await refreshUsers();
      toast.success(`Đã tạo ${result.createdCount} tài khoản học sinh.`);
      onDone();
    } catch (error) {
      toastApiError(error);
    } finally {
      setPending(false);
    }
  };

  const hasErrors = (report?.errors.length ?? 0) > 0;

  return (
    <>
      <DialogBody>
        <p className="text-sm text-muted-foreground">
          Tối đa 500 học sinh, file .xlsx không quá 2 MB. Có lỗi ở bất kỳ dòng
          nào thì không tài khoản nào được tạo.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={TEMPLATE_PATH} download>
              <DownloadIcon />
              Tải file mẫu
            </a>
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => fileInput.current?.click()}
          >
            {pending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <UploadIcon />
            )}
            Chọn file
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            aria-label="File Excel"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        {report && !hasErrors && (
          <Alert variant="info">
            <AlertTitle>File hợp lệ.</AlertTitle>
            <AlertDescription>
              Sẵn sàng tạo {report.totalRows} tài khoản học sinh.
            </AlertDescription>
          </Alert>
        )}
        {report && hasErrors && <ImportErrors errors={report.errors} />}
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Hủy</Button>
        </DialogClose>
        <Button
          disabled={pending || !file || !report || hasErrors}
          onClick={handleImport}
        >
          {report && !hasErrors
            ? `Tạo ${report.totalRows} tài khoản`
            : "Tạo tài khoản"}
        </Button>
      </DialogFooter>
    </>
  );
}

function ImportErrors({ errors }: { errors: ImportRowError[] }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-destructive">
        Có {errors.length} lỗi, hãy sửa file rồi chọn lại.
      </p>
      <ul className="max-h-56 divide-y divide-muted overflow-y-auto rounded-lg border text-sm">
        {errors.map(({ row, field, code }) => (
          <li key={`${row}-${field}-${code}`} className="px-4 py-2">
            <span className="font-medium">Dòng {row}</span> ·{" "}
            {FIELD_LABELS[field] ?? field} {ERROR_LABELS[code]}
          </li>
        ))}
      </ul>
    </div>
  );
}
