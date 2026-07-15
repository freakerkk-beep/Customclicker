import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mapOrderToPancakePayload } from '../../netlify/functions/lib/pancake';
import { customClickerProduct } from '../products/custom-clicker';

const ORIGINAL_ENV = { ...process.env };

describe('Pancake create-order payload', () => {
  beforeEach(() => {
    process.env.PANCAKE_SHOP_ID = '100157270';
    process.env.PANCAKE_WAREHOUSE_ID = 'warehouse-id';
    process.env.PANCAKE_PRODUCT_ID = 'product-id';
    process.env.PANCAKE_VARIANT_ID = 'variation-id';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('dùng variation_id và địa chỉ đúng tên trường Pancake', () => {
    const payload = mapOrderToPancakePayload({
      orderCode: 'RAC-260715-A8F2',
      product: customClickerProduct,
      customer: {
        fullName: 'Nguyen Van A',
        phone: '0912345678',
        province: 'Ha Noi',
        district: 'Soc Son',
        ward: 'Thanh Xuan',
        addressDetail: 'So 43 duong Doan Ket',
      },
      customData: {
        characterCount: 3,
        colorPaletteId: 'milk-tea-pastel',
        switchType: 'clicky',
        keys: [
          { type: 'text', value: 'A' },
          { type: 'icon', iconId: 'heart' },
          { type: 'text', value: 'C' },
        ],
      },
      palette: customClickerProduct.palettes[0],
      quantity: 1,
      unitPrice: 79_000,
      subtotal: 79_000,
      orderDetailUrl: 'https://example.com/order/RAC-260715-A8F2',
      keyLabels: ['A', 'HEART', 'C'],
    });

    expect(payload.items[0]).toEqual({
      product_id: 'product-id',
      variation_id: 'variation-id',
      quantity: 1,
    });
    expect(payload.shipping_address).toEqual({
      full_name: 'Nguyen Van A',
      phone_number: '0912345678',
      address: 'So 43 duong Doan Ket',
      ward: 'Thanh Xuan',
      district: 'Soc Son',
      province: 'Ha Noi',
    });
    expect(payload).not.toHaveProperty('bill_full_name');
    expect(payload.items[0]).not.toHaveProperty('variant_id');
    expect(payload.items[0]).not.toHaveProperty('retail_price');
  });
});
