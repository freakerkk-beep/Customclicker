import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { accessSync, constants, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CLICKER_ICON_IDS } from '../../shared/icons';
import { keyItemSchema } from '../../shared/orderSchema';
import ClickerTray from '../components/configurator/ClickerTray';
import { customClickerProduct } from '../products/custom-clicker';
import { getIconComponent } from '../utils/icons';
import { validateDesign } from '../utils/validation';

describe('cấu hình bộ màu theo index mẫu', () => {
  it('giữ đúng 7 bộ màu và mã HEX của file index.html', () => {
    expect(
      customClickerProduct.palettes.map(({ name, code, tray, key, text }) => ({
        name,
        code,
        tray,
        key,
        text,
      })),
    ).toEqual([
      {
        name: 'Milk Tea Pastel',
        code: 'M05/M06/M05',
        tray: '#C23B3B',
        key: '#F3C2CB',
        text: '#8A2E3A',
      },
      {
        name: 'Matcha Cream',
        code: 'M15/M02/M15',
        tray: '#5E6E45',
        key: '#F7F5EE',
        text: '#4A5A36',
      },
      {
        name: 'Cherry Cream',
        code: 'M16/M05/M02',
        tray: '#ECDFC6',
        key: '#A31F1F',
        text: '#FDF6EE',
      },
      {
        name: 'Black White Classic',
        code: 'M10/M02/M10',
        tray: '#1F1F1F',
        key: '#F5F0E8',
        text: '#1F1F1F',
      },
      { name: 'Taro Sweet', code: 'M02/M17/M13', tray: '#F5F0E8', key: '#B9A6D6', text: '#C8A200' },
      { name: 'Orange Pop', code: 'M03/M04/M02', tray: '#A8CDB0', key: '#E8772E', text: '#FFF5EA' },
      {
        name: 'Honey Vanilla',
        code: 'M02/S16/S19',
        tray: '#F5F0E8',
        key: '#E8C84A',
        text: '#5A4220',
      },
    ]);
  });
});

describe('danh mục icon Raccoonie', () => {
  it('chỉ có đúng 5 icon shop cung cấp', () => {
    expect(customClickerProduct.icons.map((icon) => icon.id)).toEqual([...CLICKER_ICON_IDS]);
  });

  it.each(CLICKER_ICON_IDS)('%s có SVG thật và dùng currentColor', (iconId) => {
    const Icon = getIconComponent(iconId);
    expect(Icon).not.toBeNull();
    const markup = renderToStaticMarkup(
      createElement(Icon!, { style: { color: '#123456' }, 'aria-hidden': true }),
    );
    expect(markup).toContain('viewBox="0 0 2551.18 2551.18"');
    expect(markup).toContain('fill="currentColor"');
    expect(markup).toContain('color:#123456');
    expect(markup).toContain('<path');
  });

  it('icon trên khay đổi màu theo bộ màu đang chọn', () => {
    const keys = [
      { type: 'icon' as const, iconId: 'heart' as const },
      { type: 'text' as const, value: 'A' },
      { type: 'icon' as const, iconId: 'lucky_leaf' as const },
    ];
    const milkTea = customClickerProduct.palettes[0];
    const matcha = customClickerProduct.palettes[1];

    const milkTeaMarkup = renderToStaticMarkup(
      createElement(ClickerTray, { keys, palette: milkTea, switchType: 'clicky' }),
    );
    const matchaMarkup = renderToStaticMarkup(
      createElement(ClickerTray, { keys, palette: matcha, switchType: 'clicky' }),
    );

    expect(milkTeaMarkup).toContain('background-color:#C23B3B');
    expect(milkTeaMarkup).toContain('background-color:#F3C2CB');
    expect(milkTeaMarkup).toContain('color:#8A2E3A');
    expect(matchaMarkup).toContain('background-color:#5E6E45');
    expect(matchaMarkup).toContain('background-color:#F7F5EE');
    expect(matchaMarkup).toContain('color:#4A5A36');
    expect(milkTeaMarkup).not.toBe(matchaMarkup);
  });

  it('backend từ chối icon nằm ngoài danh mục', () => {
    expect(keyItemSchema.safeParse({ type: 'icon', iconId: 'smile' }).success).toBe(false);
    expect(keyItemSchema.safeParse({ type: 'icon', iconId: 'lucky_leaf' }).success).toBe(true);
  });

  it('frontend báo lỗi khi bản nháp chứa icon cũ', () => {
    const errors = validateDesign(
      {
        characterCount: 3,
        colorPaletteId: 'milk-tea-pastel',
        switchType: 'clicky',
        keys: [
          { type: 'text', value: 'A' },
          { type: 'icon', iconId: 'smile' as never },
          { type: 'text', value: 'C' },
        ],
      },
      customClickerProduct,
    );
    expect(errors.keys).toContain('không hợp lệ');
  });
});

describe('asset bắt buộc', () => {
  it.each([
    'public/assets/logo-raccoonie.png',
    'public/audio/clicky.mp3',
    'public/audio/smooth.mp3',
    'public/assets/icons/heart.svg',
    'public/assets/icons/star.svg',
    'public/assets/icons/flower.svg',
    'public/assets/icons/dog-feet.svg',
    'public/assets/icons/lucky-leaf.svg',
  ])('%s tồn tại và không rỗng', (relativePath) => {
    const path = resolve(process.cwd(), relativePath);
    accessSync(path, constants.R_OK);
    expect(statSync(path).size).toBeGreaterThan(0);
  });
});
