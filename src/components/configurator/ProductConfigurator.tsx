import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, Undo2 } from 'lucide-react';
import type { ProductConfig } from '../../types/product';
import { useConfiguratorState } from '../../hooks/useConfiguratorState';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { calculateProductPrice } from '../../utils/pricing';
import { formatVnd } from '../../utils/currency';
import { hasErrors, isValidVnPhone, validateDesign } from '../../utils/validation';
import { createIdempotencyKey } from '../../utils/storage';
import { ApiError, createOrder } from '../../services/orderApi';
import { LIMITS } from '../../../shared/constants';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
import CharacterCountSelector from './CharacterCountSelector';
import ColorPaletteSelector from './ColorPaletteSelector';
import CustomerForm, { EMPTY_CUSTOMER, type CustomerFormValues } from './CustomerForm';
import KeyCustomizer from './KeyCustomizer';
import OrderSummary from './OrderSummary';
import ProductPreview from './ProductPreview';
import StepProgress, { type Step } from './StepProgress';
import SwitchSelector from './SwitchSelector';

const STEPS: Step[] = [
  { id: 1, label: 'Bộ màu & số phím' },
  { id: 2, label: 'Nội dung phím' },
  { id: 3, label: 'Âm thanh' },
  { id: 4, label: 'Đặt hàng' },
];

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: 'Chọn số phím và bộ màu — đế, phím và màu chữ đi cố định cùng nhau.',
  2: 'Chạm vào từng phím để nhập chữ hoặc chọn icon bạn muốn.',
  3: 'Chọn loại switch và bấm nghe thử trước khi đặt.',
  4: 'Kiểm tra lại thiết kế rồi điền thông tin nhận hàng.',
};

interface ProductConfiguratorProps {
  product: ProductConfig;
}

export default function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const config = useConfiguratorState(product);

  const [step, setStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [customer, setCustomer] = useState<CustomerFormValues>(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const idempotencyKey = useRef(createIdempotencyKey());

  useUnsavedChangesWarning(config.isDirty && !submitting);

  const palette = useMemo(
    () => product.palettes.find((item) => item.id === config.state.colorPaletteId),
    [product.palettes, config.state.colorPaletteId],
  );

  const unitPrice = calculateProductPrice(config.state.characterCount, product.pricing);
  const subtotal = unitPrice * config.state.quantity;

  const goToStep = (next: number) => {
    if (next < 1 || next > STEPS.length) return;
    setStep(next);
    setMaxReachedStep((current) => Math.max(current, next));
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleReset = () => {
    config.reset();
    setStep(1);
    setMaxReachedStep(1);
    setErrors({});
    setCustomer(EMPTY_CUSTOMER);
    idempotencyKey.current = createIdempotencyKey();
    showToast('Đã bắt đầu lại từ đầu.', 'info');
  };

  const handleRestore = () => {
    config.restorePrevious();
    showToast('Đã khôi phục thiết kế trước đó.', 'success');
  };

  const validateAll = (): Record<string, string> => {
    const next: Record<string, string> = { ...validateDesign(config.customData, product) };

    if (customer.fullName.trim().length < LIMITS.customerNameMin) {
      next['customer.fullName'] = 'Họ tên phải có ít nhất 2 ký tự.';
    }
    if (!isValidVnPhone(customer.phone)) {
      next['customer.phone'] = 'Số điện thoại không hợp lệ. Ví dụ: 0912345678.';
    }
    if (customer.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      next['customer.email'] = 'Email không hợp lệ.';
    }
    if (!customer.province.trim()) next['customer.province'] = 'Vui lòng nhập tỉnh/thành phố.';
    if (!customer.district.trim()) next['customer.district'] = 'Vui lòng nhập quận/huyện.';
    if (!customer.ward.trim()) next['customer.ward'] = 'Vui lòng nhập phường/xã.';
    if (!customer.addressDetail.trim()) {
      next['customer.addressDetail'] = 'Vui lòng nhập địa chỉ chi tiết.';
    }
    if (!customer.designConfirmed) {
      next.designConfirmed = 'Bạn cần xác nhận đã kiểm tra thiết kế trước khi đặt.';
    }

    return next;
  };

  const capturePreview = async (): Promise<string | undefined> => {
    const node = previewRef.current;
    if (!node) return undefined;

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#FFFFFF' });
      if (dataUrl.length > LIMITS.previewImageMaxChars) return undefined;
      return dataUrl;
    } catch {
      return undefined;
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      showToast('Còn vài chỗ chưa hợp lệ, bạn kiểm tra giúp mình nhé.', 'error');
      const firstKey = Object.keys(validationErrors)[0];
      if (firstKey?.startsWith('customData') || firstKey === 'keys') goToStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const previewImageBase64 = await capturePreview();

      const result = await createOrder({
        productSlug: product.slug,
        quantity: config.state.quantity,
        customData: config.customData,
        customer: {
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email.trim() || undefined,
          province: customer.province,
          district: customer.district,
          ward: customer.ward,
          addressDetail: customer.addressDetail,
          note: customer.note.trim() || undefined,
        },
        designConfirmed: true,
        idempotencyKey: idempotencyKey.current,
        previewImageBase64,
        website: customer.website,
        clientQuotedUnitPrice: unitPrice,
      });

      config.commit();
      navigate(`/order-success/${result.orderCode}`, {
        state: { order: result, productName: product.name },
        replace: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fields) setErrors(error.fields);
        showToast(error.message, 'error');
      } else {
        showToast('Không đặt được đơn. Vui lòng thử lại.', 'error');
      }
      setSubmitting(false);
    }
  };

  const isLastStep = step === STEPS.length;

  return (
    <div ref={sectionRef} className="scroll-mt-20 px-4">
      <div className="mx-auto max-w-[720px]">
        <StepProgress
          steps={STEPS}
          currentStep={step}
          maxReachedStep={maxReachedStep}
          onStepClick={goToStep}
        />

        <section className="rounded-[28px] border border-primary/25 bg-white px-5 py-6 shadow-[0_12px_40px_rgba(131,86,176,0.09)] sm:px-8 sm:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-primary sm:text-2xl">
                Bước {step} — {STEPS[step - 1]?.label}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">{STEP_DESCRIPTIONS[step]}</p>
            </div>

            <div className="w-fit shrink-0 rounded-full bg-primary-soft/60 px-3 py-1.5 text-xs text-ink-muted">
              Giá hiện tại:{' '}
              <strong className="font-display text-sm text-primary" aria-live="polite">
                {formatVnd(unitPrice)}
              </strong>
            </div>
          </div>

          <div className="my-6 sm:my-7">
            <ProductPreview
              customData={config.customData}
              palette={palette}
              captureRef={previewRef}
              compact
            />
          </div>

          <div className="space-y-7">
            {step === 1 ? (
              <>
                <CharacterCountSelector
                  product={product}
                  value={config.state.characterCount}
                  onChange={config.setCharacterCount}
                />
                <ColorPaletteSelector
                  product={product}
                  value={config.state.colorPaletteId}
                  onChange={config.setPalette}
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <KeyCustomizer
                  product={product}
                  keys={config.state.keys}
                  characterCount={config.state.characterCount}
                  palette={palette}
                  onSetKey={config.setKey}
                  onClearKey={config.clearKey}
                />
                {errors.keys ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.keys}
                  </p>
                ) : null}
              </>
            ) : null}

            {step === 3 ? (
              <SwitchSelector
                product={product}
                value={config.state.switchType}
                onChange={config.setSwitchType}
              />
            ) : null}

            {step === 4 ? (
              <>
                <OrderSummary
                  product={product}
                  customData={config.customData}
                  palette={palette}
                  quantity={config.state.quantity}
                  unitPrice={unitPrice}
                  subtotal={subtotal}
                  onQuantityChange={config.setQuantity}
                  onEditStep={goToStep}
                />
                <CustomerForm
                  values={customer}
                  errors={errors}
                  onChange={setCustomer}
                  disabled={submitting}
                />
              </>
            ) : null}
          </div>

          <div className="mt-7 flex gap-2.5">
            {step > 1 ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => goToStep(step - 1)}
                aria-label="Quay lại bước trước"
                className="!rounded-full px-5"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
            ) : null}

            {isLastStep ? (
              <Button
                size="lg"
                fullWidth
                onClick={handleSubmit}
                loading={submitting}
                className="!rounded-full"
              >
                {submitting ? 'Đang gửi đơn…' : `Đặt hàng – ${formatVnd(subtotal)}`}
              </Button>
            ) : (
              <Button
                size="lg"
                fullWidth
                onClick={() => goToStep(step + 1)}
                className="!rounded-full"
              >
                Tiếp theo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </section>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-1 text-xs">
          {config.canRestore ? (
            <button
              type="button"
              onClick={handleRestore}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-ink-muted hover:bg-white/70 hover:text-primary"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
              Khôi phục thiết kế trước
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-ink-muted hover:bg-white/70 hover:text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Bắt đầu lại
          </button>
        </div>
      </div>
    </div>
  );
}
