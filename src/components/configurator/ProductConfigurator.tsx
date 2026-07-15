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
  { id: 1, label: 'Số ký tự' },
  { id: 2, label: 'Chọn màu' },
  { id: 3, label: 'Custom phím' },
  { id: 4, label: 'Âm thanh' },
  { id: 5, label: 'Đặt hàng' },
];

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

  const previewRef = useRef<HTMLDivElement>(null);
  // Giữ nguyên một key cho mọi lần thử lại của CÙNG một đơn -> bấm nhiều lần
  // hoặc mạng chập chờn cũng không tạo ra hai đơn.
  const idempotencyKey = useRef(createIdempotencyKey());

  useUnsavedChangesWarning(config.isDirty && !submitting);

  const palette = useMemo(
    () => product.palettes.find((p) => p.id === config.state.colorPaletteId),
    [product.palettes, config.state.colorPaletteId],
  );

  const unitPrice = calculateProductPrice(config.state.characterCount, product.pricing);
  const subtotal = unitPrice * config.state.quantity;

  const goToStep = (next: number) => {
    setStep(next);
    setMaxReachedStep((current) => Math.max(current, next));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    config.reset();
    setStep(1);
    setMaxReachedStep(1);
    setErrors({});
    idempotencyKey.current = createIdempotencyKey();
    showToast('Đã bắt đầu lại từ đầu.', 'info');
  };

  const handleRestore = () => {
    config.restorePrevious();
    showToast('Đã khôi phục thiết kế trước đó.', 'success');
  };

  /** Kiểm tra ngay trên máy khách để báo lỗi sớm. Server vẫn kiểm tra lại toàn bộ. */
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

  /** Ảnh preview là tuỳ chọn — chụp lỗi thì vẫn đặt hàng bình thường. */
  const capturePreview = async (): Promise<string | undefined> => {
    const node = previewRef.current;
    if (!node) return undefined;

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#FFF9F3' });
      if (dataUrl.length > LIMITS.previewImageMaxChars) return undefined;
      return dataUrl;
    } catch {
      return undefined;
    }
  };

  const handleSubmit = async () => {
    if (submitting) return; // chặn double click

    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      showToast('Còn vài chỗ chưa hợp lệ, bạn kiểm tra giúp mình nhé.', 'error');
      const firstKey = Object.keys(validationErrors)[0];
      if (firstKey?.startsWith('customData') || firstKey === 'keys') goToStep(3);
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

      // Chỉ tới trang thành công KHI backend đã ghi nhận đơn và trả về mã đơn.
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
    <div className="mx-auto max-w-6xl px-4 pb-32 lg:pb-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Thiết kế clicker của bạn</h1>
        <div className="flex gap-2">
          {config.canRestore ? (
            <Button variant="secondary" size="sm" onClick={handleRestore} icon={<Undo2 className="h-3.5 w-3.5" />}>
              Khôi phục thiết kế trước
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="h-3.5 w-3.5" />}>
            Bắt đầu lại
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ------- Cột trái: các bước tuỳ chỉnh ------- */}
        <div className="order-2 space-y-5 lg:order-1">
          <StepProgress
            steps={STEPS}
            currentStep={step}
            maxReachedStep={maxReachedStep}
            onStepClick={goToStep}
          />

          {step === 1 ? (
            <CharacterCountSelector
              product={product}
              value={config.state.characterCount}
              onChange={config.setCharacterCount}
            />
          ) : null}

          {step === 2 ? (
            <ColorPaletteSelector
              product={product}
              value={config.state.colorPaletteId}
              onChange={config.setPalette}
            />
          ) : null}

          {step === 3 ? (
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

          {step === 4 ? (
            <SwitchSelector
              product={product}
              value={config.state.switchType}
              onChange={config.setSwitchType}
            />
          ) : null}

          {step === 5 ? (
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
              <div className="hidden lg:block">
                <Button size="lg" fullWidth onClick={handleSubmit} loading={submitting}>
                  {submitting ? 'Đang gửi đơn…' : `Đặt hàng – ${formatVnd(subtotal)}`}
                </Button>
              </div>
            </>
          ) : null}

          {/* Điều hướng bước trên desktop */}
          <div className="hidden items-center justify-between gap-3 lg:flex">
            <Button
              variant="secondary"
              onClick={() => goToStep(step - 1)}
              disabled={step === 1}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Quay lại
            </Button>
            {!isLastStep ? (
              <Button onClick={() => goToStep(step + 1)}>
                Tiếp tục
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        </div>

        {/* ------- Cột phải: preview (sticky trên desktop, trên cùng ở mobile) ------- */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <ProductPreview customData={config.customData} palette={palette} captureRef={previewRef} />
          </div>
        </div>
      </div>

      {/* ------- Thanh cố định đáy màn hình trên điện thoại ------- */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-4 pt-3 backdrop-blur lg:hidden">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs text-ink-muted">
            {config.state.characterCount} ký tự
            {config.state.quantity > 1 ? ` × ${config.state.quantity}` : ''}
          </span>
          <span className="font-display text-lg font-bold text-primary">{formatVnd(subtotal)}</span>
        </div>
        <div className="flex gap-2">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => goToStep(step - 1)} aria-label="Quay lại bước trước">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : null}
          {isLastStep ? (
            <Button fullWidth onClick={handleSubmit} loading={submitting}>
              {submitting ? 'Đang gửi đơn…' : `Đặt hàng – ${formatVnd(subtotal)}`}
            </Button>
          ) : (
            <Button fullWidth onClick={() => goToStep(step + 1)}>
              Tiếp tục
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
