import { AlertCircle } from 'lucide-react';
import { LIMITS } from '../../../shared/constants';
import { filterPhoneInput } from '../../utils/validation';
import Card, { CardTitle } from '../ui/Card';

export interface CustomerFormValues {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  note: string;
  designConfirmed: boolean;
  /** Honeypot — người thật không bao giờ thấy trường này. */
  website: string;
}

export const EMPTY_CUSTOMER: CustomerFormValues = {
  fullName: '',
  phone: '',
  email: '',
  province: '',
  district: '',
  ward: '',
  addressDetail: '',
  note: '',
  designConfirmed: false,
  website: '',
};

interface CustomerFormProps {
  values: CustomerFormValues;
  errors: Record<string, string>;
  onChange: (values: CustomerFormValues) => void;
  disabled?: boolean;
}

interface FieldProps {
  id: keyof CustomerFormValues;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  inputMode?: 'text' | 'tel' | 'email';
  autoComplete?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function Field({
  id,
  label,
  required,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  error,
  value,
  onChange,
  disabled,
}: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : <span className="ml-1 text-xs font-normal text-ink-muted">(không bắt buộc)</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`field-input ${error ? 'field-input-error' : ''}`}
      />
      {error ? (
        <p id={errorId} className="field-error">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function CustomerForm({ values, errors, onChange, disabled }: CustomerFormProps) {
  const set = <K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) =>
    onChange({ ...values, [key]: value });

  return (
    <Card>
      <CardTitle hint="Shop gọi xác nhận trước khi làm hàng, nên số điện thoại cần chính xác.">
        Thông tin nhận hàng
      </CardTitle>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="fullName"
            label="Họ và tên"
            required
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            value={values.fullName}
            error={errors['customer.fullName'] ?? errors.fullName}
            onChange={(v) => set('fullName', v)}
            disabled={disabled}
          />
          <Field
            id="phone"
            label="Số điện thoại"
            required
            placeholder="0912345678"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            error={errors['customer.phone'] ?? errors.phone}
            // Chặn chữ ngay khi gõ — chỉ nhận số và các ký tự phân cách.
            onChange={(v) => set('phone', filterPhoneInput(v))}
            disabled={disabled}
          />
        </div>

        <Field
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="ban@email.com"
          value={values.email}
          error={errors['customer.email'] ?? errors.email}
          onChange={(v) => set('email', v)}
          disabled={disabled}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            id="province"
            label="Tỉnh/Thành phố"
            required
            placeholder="TP. Hồ Chí Minh"
            autoComplete="address-level1"
            value={values.province}
            error={errors['customer.province'] ?? errors.province}
            onChange={(v) => set('province', v)}
            disabled={disabled}
          />
          <Field
            id="district"
            label="Quận/Huyện"
            required
            placeholder="Quận 1"
            autoComplete="address-level2"
            value={values.district}
            error={errors['customer.district'] ?? errors.district}
            onChange={(v) => set('district', v)}
            disabled={disabled}
          />
          <Field
            id="ward"
            label="Phường/Xã"
            required
            placeholder="Phường Bến Nghé"
            autoComplete="address-level3"
            value={values.ward}
            error={errors['customer.ward'] ?? errors.ward}
            onChange={(v) => set('ward', v)}
            disabled={disabled}
          />
        </div>

        <Field
          id="addressDetail"
          label="Địa chỉ chi tiết"
          required
          placeholder="Số nhà, tên đường, toà nhà…"
          autoComplete="street-address"
          value={values.addressDetail}
          error={errors['customer.addressDetail'] ?? errors.addressDetail}
          onChange={(v) => set('addressDetail', v)}
          disabled={disabled}
        />

        <div>
          <label htmlFor="note" className="field-label">
            Ghi chú cho shop
            <span className="ml-1 text-xs font-normal text-ink-muted">(không bắt buộc)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={LIMITS.noteMax}
            value={values.note}
            disabled={disabled}
            onChange={(event) => set('note', event.target.value)}
            placeholder="Ví dụ: giao giờ hành chính, gói làm quà tặng…"
            className="field-input resize-none"
          />
          <p className="mt-1 text-right text-[11px] text-ink-muted">
            {values.note.length}/{LIMITS.noteMax}
          </p>
        </div>

        {/* Honeypot chống bot: ẩn khỏi mắt người và khỏi trình đọc màn hình. */}
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <label htmlFor="website">Bỏ trống ô này</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(event) => set('website', event.target.value)}
          />
        </div>

        {/* Xác nhận thiết kế — bắt buộc */}
        <div
          className={`rounded-xl border p-3.5 ${
            errors.designConfirmed ? 'border-red-300 bg-red-50' : 'border-line bg-cream'
          }`}
        >
          <label htmlFor="designConfirmed" className="flex cursor-pointer items-start gap-3">
            <input
              id="designConfirmed"
              name="designConfirmed"
              type="checkbox"
              checked={values.designConfirmed}
              disabled={disabled}
              onChange={(event) => set('designConfirmed', event.target.checked)}
              aria-describedby={errors.designConfirmed ? 'designConfirmed-error' : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-primary focus:ring-primary"
            />
            <span className="text-sm">
              Tôi đã kiểm tra đúng nội dung, số lượng ký tự và màu sắc của sản phẩm.
            </span>
          </label>
          {errors.designConfirmed ? (
            <p id="designConfirmed-error" className="field-error ml-7">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {errors.designConfirmed}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
