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
  1: 'Chọn bộ màu, số phím và xem giá nhỏ cập nhật ngay phía trên.',
  2: 'Chạm vào từng phím để nhập đúng 1 ký tự IN HOA hoặc chọn 1 icon.',
  3: 'Chọn loại switch rồi bấm nghe thử trước khi chốt.',
  4: 'Kiểm tra lại thiết kế và điền thông tin nhận hàng.',
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

  const validateCurrentStep = (): boolean => {
    if (step !== 2) return true;

    const designErrors = validateDesign(config.customData, product);
    if (hasErrors(designErrors)) {
      setErrors((current) => ({ ...current, ...designErrors }));
      showToast('Bạn cần nhập đủ nội dung cho từng phím trước khi sang bước tiếp theo.', 'error');
      return false;
    }

    setErrors((current) => {
      const next = { ...current };
      delete next.keys;
      return next;
    });
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    goToStep(step + 1);
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
    <div ref={sectionRef} className="scroll-mt-20 px-4 pb-10">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
          {config.canRestore ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRestore}
              icon={<Undo2 className="h-3.5 w-3.5" />}
            >
              Khôi phục thiết kế trước
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            icon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Bắt đầu lại
          </Button>
        </div>

        <StepProgress
          steps={STEPS}
          currentStep={step}
          maxReachedStep={maxReachedStep}
          onStepClick={goToStep}
        />

        <section className="rounded-[30px] border border-primary/20 bg-white px-5 py-6 shadow-[0_12px_40px_rgba(131,86,176,0.09)] sm:px-8 sm:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-primary sm:text-2xl">
                Bước {step} — {STEPS[step - 1]?.label}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">{STEP_DESCRIPTIONS[step]}</p>
            </div>

            <div className="w-fit shrink-0 rounded-full bg-primary-soft/70 px-3 py-1.5 text-xs text-ink-muted">
              Giá hiện tại:{' '}
              <strong className="font-display text-sm text-primary" aria-live="polite">
                {formatVnd(unitPrice)}
              </strong>
            </div>
          </div>

          <div className="mt-6 space-y-6 sm:mt-7 sm:space-y-7">
            {step === 1 ? (
              <>
                <ProductPreview
                  customData={config.customData}
                  palette={palette}
                  captureRef={previewRef}
                  compact
                />
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
              <KeyCustomizer
                product={product}
                keys={config.state.keys}
                characterCount={config.state.characterCount}
                palette={palette}
                onSetKey={config.setKey}
                errorMessage={errors.keys}
              />
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
                <ProductPreview
                  customData={config.customData}
                  palette={palette}
                  captureRef={previewRef}
                  compact
                />
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

          <div className={`mt-8 flex gap-3 ${step === 1 ? 'justify-end' : 'flex-col sm:flex-row'} ${step === 4 ? 'sm:items-center' : ''}`}>
            {step > 1 ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => goToStep(step - 1)}
                className="min-w-[180px] sm:flex-1"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Quay lại
              </Button>
            ) : null}

            {isLastStep ? (
              <Button
                size="lg"
                onClick={handleSubmit}
                loading={submitting}
                className="min-w-[220px] sm:flex-1"
              >
                {submitting ? 'Đang gửi đơn…' : `Đặt hàng – ${formatVnd(subtotal)}`}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleNextStep}
                className={step === 1 ? 'min-w-[220px]' : 'min-w-[220px] sm:flex-1'}
              >
                Tiếp theo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
