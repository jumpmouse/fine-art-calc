import React, { useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import { t, setLang, type Lang } from './i18n';

type LayerResult = {
  key: 'paspartu' | 'frame1' | 'frame2';
  label: string;
  outerWidthCm: number;
  outerHeightCm: number;
  lengthCm: number; // total linear length for this layer (perimeter)
  lengthM: number;
  pricePerM: number;
  lineTotal: number;
  enabled: boolean;
};

const colors = {
  // Keep background white per request
  bg: '#FFFFFF',
  card: '#FFFFFF',
  // Pastel turquoise/blue palette (Van Gogh evening blues inspired)
  primary: '#2D9CDB', // cerulean
  accent: '#E6F4F7', // pale aqua
  text: '#0F172A',   // slate-900
  muted: '#6B7280',  // gray-500
  border: '#E5E7EB', // gray-200
  success: '#1D9BF0', // blue success
  placeholder: '#9CA3AF', // gray-400 for placeholders
  borderStrong: '#94A3B8', // slate-400 for stronger input borders
};

function toNumber(value: string): number {
  if (!value) return 0;
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function toFixed2(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function toFixed1(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

export default function App() {
  // Inputs (centimeters)
  const [imgWidthCm, setImgWidthCm] = useState<string>('');
  const [imgHeightCm, setImgHeightCm] = useState<string>('');
  const [wTouched, setWTouched] = useState<boolean>(false);
  const [hTouched, setHTouched] = useState<boolean>(false);

  const [paspartuEnabled, setPaspartuEnabled] = useState<boolean>(false);
  const [paspartuWidthCm, setPaspartuWidthCm] = useState<string>('');

  const [frame1WidthCm, setFrame1WidthCm] = useState<string>(''); // required

  const [frame2Enabled, setFrame2Enabled] = useState<boolean>(false);
  const [frame2WidthCm, setFrame2WidthCm] = useState<string>('');

  // Prices (per meter)
  const [pricePaspartu, setPricePaspartu] = useState<string>('');
  const [priceFrame1, setPriceFrame1] = useState<string>('');
  const [priceFrame2, setPriceFrame2] = useState<string>('');

  // Global waste/kerf option (applies to all enabled layers)
  const [wasteEnabled, setWasteEnabled] = useState<boolean>(false);
  const [wastePercent, setWastePercent] = useState<string>('3'); // 3.0–5.0

  const summaryRef = useRef<View>(null);
  const [summarySize, setSummarySize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Language (default Serbian)
  const [lang, setLangState] = useState<Lang>('sr');
  function switchLang(next: Lang) {
    setLang(next);
    setLangState(next);
  }

  function clampWaste(p: number): number {
    if (!Number.isFinite(p)) return 3;
    return Math.min(5, Math.max(3, Math.round(p * 10) / 10));
  }

  function formatPercentDisplay(s: string): string {
    const n = clampWaste(toNumber(s));
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }

  function formatMaxDecimals(s: string, maxDecimals: number): string {
    if (s == null) return '';
    const normalized = s.replace(',', '.');
    // Keep only digits and one dot
    const parts = normalized.split('.');
    const head = parts[0].replace(/\D/g, '');
    const tailRaw = parts.slice(1).join('');
    const tail = tailRaw.replace(/\D/g, '').slice(0, Math.max(0, maxDecimals));
    return tail.length > 0 ? `${head}.${tail}` : head;
  }

  const results = useMemo<LayerResult[]>(() => {
    const W = Math.max(0, toNumber(imgWidthCm));
    const H = Math.max(0, toNumber(imgHeightCm));
    let curW = W;
    let curH = H;

    const layers: LayerResult[] = [];

    const waste = clampWaste(toNumber(wastePercent));
    const factor = wasteEnabled ? 1 + waste / 100 : 1;

    // Paspartu (optional)
    const pw = Math.max(0, toNumber(paspartuWidthCm));
    if (paspartuEnabled && pw > 0) {
      const oW = curW + 2 * pw;
      const oH = curH + 2 * pw;
      const baseLenCm = 2 * (oW + oH);
      const lengthM = (baseLenCm / 100) * factor;
      const lengthCm = lengthM * 100;
      const pricePerM = Math.max(0, toNumber(pricePaspartu));
      layers.push({
        key: 'paspartu',
        label: t('paspartu'),
        outerWidthCm: oW,
        outerHeightCm: oH,
        lengthCm,
        lengthM,
        pricePerM,
        lineTotal: lengthM * pricePerM,
        enabled: true,
      });
      curW = oW;
      curH = oH;
    } else if (paspartuEnabled) {
      // Show row but mark disabled so size/length display as '-'
      layers.push({
        key: 'paspartu',
        label: t('paspartu'),
        outerWidthCm: curW,
        outerHeightCm: curH,
        lengthCm: 0,
        lengthM: 0,
        pricePerM: Math.max(0, toNumber(pricePaspartu)),
        lineTotal: 0,
        enabled: false,
      });
    }

    // Frame 1 (required)
    const f1 = Math.max(0, toNumber(frame1WidthCm));
    if (f1 > 0) {
      const oW = curW + 2 * f1;
      const oH = curH + 2 * f1;
      const baseLenCm = 2 * (oW + oH);
      const lengthM = (baseLenCm / 100) * factor;
      const lengthCm = lengthM * 100;
      const pricePerM = Math.max(0, toNumber(priceFrame1));
      layers.push({
        key: 'frame1',
        label: t('frame'),
        outerWidthCm: oW,
        outerHeightCm: oH,
        lengthCm,
        lengthM,
        pricePerM,
        lineTotal: lengthM * pricePerM,
        enabled: true,
      });
      curW = oW;
      curH = oH;
    } else {
      layers.push({
        key: 'frame1',
        label: t('frame'),
        outerWidthCm: curW,
        outerHeightCm: curH,
        lengthCm: 0,
        lengthM: 0,
        pricePerM: Math.max(0, toNumber(priceFrame1)),
        lineTotal: 0,
        enabled: false,
      });
    }

    // Frame 2 (optional)
    const f2 = Math.max(0, toNumber(frame2WidthCm));
    if (frame2Enabled && f2 > 0) {
      const oW = curW + 2 * f2;
      const oH = curH + 2 * f2;
      const baseLenCm = 2 * (oW + oH);
      const lengthM = (baseLenCm / 100) * factor;
      const lengthCm = lengthM * 100;
      const pricePerM = Math.max(0, toNumber(priceFrame2));
      layers.push({
        key: 'frame2',
        label: t('secondFrame'),
        outerWidthCm: oW,
        outerHeightCm: oH,
        lengthCm,
        lengthM,
        pricePerM,
        lineTotal: lengthM * pricePerM,
        enabled: true,
      });
    } else {
      layers.push({
        key: 'frame2',
        label: t('secondFrame'),
        outerWidthCm: curW,
        outerHeightCm: curH,
        lengthCm: 0,
        lengthM: 0,
        pricePerM: Math.max(0, toNumber(priceFrame2)),
        lineTotal: 0,
        enabled: false,
      });
    }

    return layers;
  }, [
    imgWidthCm,
    imgHeightCm,
    paspartuEnabled,
    paspartuWidthCm,
    frame1WidthCm,
    frame2Enabled,
    frame2WidthCm,
    pricePaspartu,
    priceFrame1,
    priceFrame2,
    wasteEnabled,
    wastePercent,
    lang,
  ]);

  const grandTotal = useMemo(() => {
    return results.reduce((acc, r) => acc + (r.enabled ? r.lineTotal : 0), 0);
  }, [results]);

  const storeLinks = {
    appStore: (Constants.expoConfig?.extra as any)?.appStoreUrl as string | undefined,
    playStore: (Constants.expoConfig?.extra as any)?.playStoreUrl as string | undefined,
  };

  const dimsReady = toNumber(imgWidthCm) > 0 && toNumber(imgHeightCm) > 0;

  async function exportAsImage() {
    try {
      const base64 = await captureRef(summaryRef, {
        format: 'png',
        quality: 1,
        result: 'base64',
      });
      const fileName = `fine-art-calc-${Date.now()}.png`;

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const directory = ((FileSystem as any).documentDirectory as string) || ((FileSystem as any).cacheDirectory as string) || '';
      const fileUri = directory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        // Use string literal to avoid type issues with EncodingType
        encoding: 'base64' as any,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share image',
        });
      } else {
        Alert.alert('Saved', `Image saved to: ${fileUri}`);
      }
    } catch (e: any) {
      Alert.alert('Export error', e?.message ?? 'Failed to export image.');
    }
  }

  async function exportAsPDF() {
    try {
      const base64 = await captureRef(summaryRef, {
        format: 'png',
        quality: 1,
        result: 'base64',
      });

      if (Platform.OS === 'web') {
        // Use jsPDF in web
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { default: jsPDF } = require('jspdf');
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 24;
        const availW = pageW - margin * 2;
        const availH = pageH - margin * 2;
        const ratio = summarySize.w > 0 && summarySize.h > 0 ? summarySize.h / summarySize.w : 1.414; // fallback
        const imgW = availW;
        const imgH = Math.min(availW * ratio, availH);
        const offsetY = margin + (availH - imgH) / 2;
        doc.addImage(`data:image/png;base64,${base64}`, 'PNG', margin, offsetY, imgW, imgH);
        doc.save(`fine-art-calc-${Date.now()}.pdf`);
        return;
      }

      const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
        <body style="margin:0;padding:0;">
          <img src="data:image/png;base64,${base64}" style="width:100%;height:auto;display:block;"/>
        </body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share PDF',
        });
      } else {
        Alert.alert('Saved', `PDF saved to: ${uri}`);
      }
    } catch (e: any) {
      Alert.alert('Export error', e?.message ?? 'Failed to export PDF.');
    }
  }

  function resetAll() {
    setImgWidthCm('');
    setImgHeightCm('');
    setWTouched(false);
    setHTouched(false);
    setPaspartuEnabled(false);
    setPaspartuWidthCm('');
    setFrame1WidthCm('');
    setFrame2Enabled(false);
    setFrame2WidthCm('');
    setPricePaspartu('');
    setPriceFrame1('');
    setPriceFrame2('');
    setWasteEnabled(false);
    setWastePercent('3');
  }

  const frame1Missing = toNumber(frame1WidthCm) <= 0;
  const inputsMissing = toNumber(imgWidthCm) <= 0 || toNumber(imgHeightCm) <= 0 || frame1Missing;

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>
          <View style={styles.pagePad}>
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Fine Art Calc</Text>
                <View style={styles.titleActions}>
                  <TouchableOpacity onPress={resetAll} style={styles.resetBtn} accessibilityLabel="Reset all inputs">
                    <Text style={styles.resetBtnIcon}>↺</Text>
              </TouchableOpacity>
              <View style={styles.langSelect}>
                <TouchableOpacity onPress={() => switchLang('sr')} style={[styles.langBtn, lang === 'sr' && styles.langBtnActive]} accessibilityRole="button" accessibilityLabel="Serbian">
                  <Text style={[styles.langBtnText, lang === 'sr' && styles.langBtnTextActive]}>SR</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => switchLang('en')} style={[styles.langBtn, lang === 'en' && styles.langBtnActive]} accessibilityRole="button" accessibilityLabel="English">
                  <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextActive]}>EN</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>

          <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('paintingDimensions')}</Text>
          <View style={styles.row}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>{t('widthCm')}</Text>
              <TextInput
                value={imgWidthCm}
                onChangeText={setImgWidthCm}
                inputMode="decimal"
                keyboardType="numeric"
                placeholder={t('egNumber', { n: 60 })}
                placeholderTextColor={colors.placeholder}
                onEndEditing={() => { setImgWidthCm(formatMaxDecimals(imgWidthCm, 1)); setWTouched(true); }}
                onBlur={() => setWTouched(true)}
                style={[styles.input, wTouched && toNumber(imgWidthCm) <= 0 ? styles.inputError : null]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>{t('heightCm')}</Text>
              <TextInput
                value={imgHeightCm}
                onChangeText={setImgHeightCm}
                inputMode="decimal"
                keyboardType="numeric"
                placeholder={t('egNumber', { n: 80 })}
                placeholderTextColor={colors.placeholder}
                onEndEditing={() => { setImgHeightCm(formatMaxDecimals(imgHeightCm, 1)); setHTouched(true); }}
                onBlur={() => setHTouched(true)}
                style={[styles.input, hTouched && toNumber(imgHeightCm) <= 0 ? styles.inputError : null]}
              />
            </View>
          </View>

          </View>

          <View
            style={[styles.card, !dimsReady && styles.dimmed, Platform.OS === 'web' && !dimsReady ? styles.noPointerEvents : null]}
            {...(Platform.OS !== 'web' ? ({ pointerEvents: dimsReady ? 'auto' : 'none' } as any) : {})}
          >
          <Text style={styles.sectionTitle}>{t('layers')}</Text>

          <View style={styles.rowJustify}>
            <Text style={[
              styles.labelStrong,
              styles.subheadingUnderline,
              !paspartuEnabled && styles.labelDisabled,
              !paspartuEnabled && styles.italic,
            ]}>{t('paspartu')}</Text>
            <View style={styles.switchRow}>
              <Text style={styles.labelMuted}>{t('add')}</Text>
              <Switch
                value={paspartuEnabled}
                onValueChange={setPaspartuEnabled}
                disabled={!dimsReady}
                trackColor={{ false: colors.border, true: colors.accent }}
              />
            </View>
          </View>
          {paspartuEnabled ? (
            <View style={styles.row}>              
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('widthCm')}</Text>
                <TextInput
                  value={paspartuWidthCm}
                  onChangeText={setPaspartuWidthCm}
                  inputMode="decimal"
                  keyboardType="numeric"
                  placeholder={t('egNumber', { n: 5 })}
                  placeholderTextColor={colors.placeholder}
                  onEndEditing={() => setPaspartuWidthCm(formatMaxDecimals(paspartuWidthCm, 1))}
                  editable={dimsReady}
                  style={styles.input}
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('unitPrice')}</Text>
                <TextInput
                  value={pricePaspartu}
                  onChangeText={setPricePaspartu}
                  inputMode="decimal"
                  keyboardType="numeric"
                  placeholder={t('egNumber', { n: 500 })}
                  placeholderTextColor={colors.placeholder}
                  onEndEditing={() => setPricePaspartu(formatMaxDecimals(pricePaspartu, 2))}
                  editable={dimsReady}
                  style={styles.input}
                />
              </View>
            </View>
          ) : null}
          <View style={styles.divider} />

          <View style={styles.rowJustify}>
            <Text style={[styles.labelStrong, styles.subheadingUnderline]}>{t('frame')}</Text>
            <Text style={[styles.badge, frame1Missing ? styles.badgeWarn : styles.badgeOk]}>{frame1Missing ? t('required') : t('ok')}</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>{t('widthCm')}</Text>
              <TextInput
                value={frame1WidthCm}
                onChangeText={setFrame1WidthCm}
                inputMode="decimal"
                keyboardType="numeric"
                placeholder={t('egNumber', { n: 3 })}
                placeholderTextColor={colors.placeholder}
                onEndEditing={() => setFrame1WidthCm(formatMaxDecimals(frame1WidthCm, 1))}
                editable={dimsReady}
                style={styles.input}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>{t('unitPrice')}</Text>
              <TextInput
                value={priceFrame1}
                onChangeText={setPriceFrame1}
                inputMode="decimal"
                keyboardType="numeric"
                placeholder={t('egNumber', { n: 500 })}
                placeholderTextColor={colors.placeholder}
                onEndEditing={() => setPriceFrame1(formatMaxDecimals(priceFrame1, 2))}
                editable={dimsReady}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={[styles.rowJustify, styles.sectionGapSmall]}>
            <Text style={[
              styles.labelStrong,
              styles.subheadingUnderline,
              !frame2Enabled && styles.labelDisabled,
              !frame2Enabled && styles.italic,
            ]}>{t('secondFrame')}</Text>
            <View style={styles.switchRow}>
              <Text style={styles.labelMuted}>{t('add')}</Text>
              <Switch
                value={frame2Enabled}
                onValueChange={setFrame2Enabled}
                disabled={!dimsReady}
                trackColor={{ false: colors.border, true: colors.accent }}
              />
            </View>
          </View>
          {frame2Enabled ? (
            <View style={styles.row}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('widthCm')}</Text>
                <TextInput
                  value={frame2WidthCm}
                  onChangeText={setFrame2WidthCm}
                  inputMode="decimal"
                  keyboardType="numeric"
                  placeholder={t('egNumber', { n: 2 })}
                  placeholderTextColor={colors.placeholder}
                  onEndEditing={() => setFrame2WidthCm(formatMaxDecimals(frame2WidthCm, 1))}
                  editable={dimsReady}
                  style={styles.input}
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('unitPrice')}</Text>
                <TextInput
                  value={priceFrame2}
                  onChangeText={setPriceFrame2}
                  inputMode="decimal"
                  keyboardType="numeric"
                  placeholder={t('egNumber', { n: 500 })}
                  placeholderTextColor={colors.placeholder}
                  onEndEditing={() => setPriceFrame2(formatMaxDecimals(priceFrame2, 2))}
                  editable={dimsReady}
                  style={styles.input}
                />
              </View>
            </View>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.rowJustify}>
            <Text style={[
              styles.labelStrong,
              styles.subheadingUnderline,
              !wasteEnabled && styles.labelDisabled,
              !wasteEnabled && styles.italic,
            ]}>{t('wasteKerf')}</Text>
            <View style={styles.switchRow}>
              <Text style={styles.labelMuted}>{t('applyToAll')}</Text>
              <Switch
                value={wasteEnabled}
                onValueChange={setWasteEnabled}
                disabled={!dimsReady}
                trackColor={{ false: colors.border, true: colors.accent }}
              />
            </View>
          </View>
          {wasteEnabled ? (
            <View style={styles.row}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('wastePercentLabel')}</Text>
                <TextInput
                  value={wastePercent}
                  onChangeText={setWastePercent}
                  onEndEditing={() => setWastePercent(formatPercentDisplay(wastePercent))}
                  inputMode="decimal"
                  keyboardType="numeric"
                  placeholder={t('egNumber', { n: 3 })}
                  placeholderTextColor={colors.placeholder}
                  editable={dimsReady}
                  style={[styles.input, styles.inputNarrow]}
                />
              </View>
            </View>
          ) : null}
          </View>

        <View
          style={[styles.card, !dimsReady && styles.dimmed, Platform.OS === 'web' && !dimsReady ? styles.noPointerEvents : null]}
          {...(Platform.OS !== 'web' ? ({ pointerEvents: dimsReady ? 'auto' : 'none' } as any) : {})}
          ref={summaryRef}
          onLayout={(e) => setSummarySize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        >
          <Text style={styles.sectionTitle}>{t('summary')}</Text>
          <Text style={styles.muted}>
            {(() => {
              const wv = Math.max(0, toNumber(imgWidthCm));
              const hv = Math.max(0, toNumber(imgHeightCm));
              const wStr = wv > 0 ? toFixed1(wv) : '0';
              const hStr = hv > 0 ? toFixed1(hv) : '0';
              return t('paintingLine', { w: wStr, h: hStr });
            })()}
          </Text>
          {wasteEnabled ? (
            <Text style={styles.muted}>{t('wasteApplied', { p: formatPercentDisplay(wastePercent) })}</Text>
          ) : null}

          <View style={styles.tableHead}>
            <Text style={[styles.th, { flex: 1.2 }]}>{t('item')}</Text>
            <Text style={[styles.th, { flex: 1 }]}>{t('sizeCm')}</Text>
            <Text style={[styles.th, { flex: 1 }]}>{t('lengthCm')}</Text>
            <Text style={[styles.th, { flex: 1 }]}>{t('unitPrice')}</Text>
            <Text style={[styles.th, { flex: 1 }]}>{t('price')}</Text>
          </View>

          {results.filter((r) => r.key === 'frame1' || r.enabled).map((r) => (
            <View key={r.key} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 1.2 }]}>{r.label}</Text>
              <Text style={[styles.td, { flex: 1 }]}> 
                {r.enabled ? `2 × ${toFixed1(r.outerWidthCm)}\n2 × ${toFixed1(r.outerHeightCm)}` : '-'}
              </Text>
              <Text style={[styles.td, { flex: 1 }]}>
                {r.enabled
                  ? (r.key === 'paspartu'
                      ? `${toFixed1(r.lengthCm)}\n(x ${toFixed1(Math.max(0, toNumber(paspartuWidthCm)))}cm)`
                      : `${toFixed1(r.lengthCm)}`)
                  : '-'}
              </Text>
              <Text style={[styles.td, { flex: 1 }]}>
                {r.enabled ? `${toFixed2(r.pricePerM)}` : '-'}
              </Text>
              <Text style={[styles.td, { flex: 1, fontWeight: '600' }]}>
                {r.enabled ? `${toFixed2(r.lineTotal)}` : '-'}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('grandTotal')}</Text>
            <Text style={[styles.totalValue, styles.totalValuePad]}>{toFixed2(grandTotal)}</Text>
          </View>
          <View style={{ height: 40 }} />
        </View>
        </View>
        </View>
          <View style={[styles.footerBar]}> 
            <View style={styles.footerInner}>
              <Text style={styles.footerText}>Inspired by</Text>
              <Image
                source={require('./assets/inspiration.png')}
                style={styles.footerLogo}
                resizeMode="contain"
                accessible
                accessibilityLabel="Inspired by"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    // No padding here; we pad the inner wrapper instead to keep footer full-width
    padding: 0,
  },
  pagePad: {
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetBtnIcon: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  langBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langBtnText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 12,
  },
  langBtnTextActive: {
    color: '#fff',
  },
  downloadCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  downloadRow: {
    flexDirection: 'row',
    gap: 10,
  },
  footer: {
    backgroundColor: colors.accent,
    borderTopWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 12,
    marginTop: 14,
  },
  linkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  linkBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: Platform.select({ web: 20, default: 14 }),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowJustify: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    fontWeight: '700',
  },
  inputError: {
    borderColor: '#EF4444', // red-500
  },
  labelStrong: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  subheadingUnderline: {
    textDecorationLine: 'underline',
  },
  labelDisabled: {
    color: '#9CA3AF', // gray-400 for disabled labels
  },
  labelMuted: {
    fontSize: 12,
    color: colors.muted,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  inputNarrow: {
    width: 120,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
    fontSize: 12,
    color: '#fff',
  },
  badgeWarn: {
    backgroundColor: '#F59E0B',
  },
  badgeOk: {
    backgroundColor: colors.success,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
  sectionGapSmall: {
    marginTop: 6,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIconText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 12,
  },
  tooltip: {
    marginTop: 6,
    backgroundColor: colors.accent,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tooltipOverlay: {
    position: 'absolute',
    top: 36,
    right: 8,
    backgroundColor: colors.accent,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tooltipText: {
    color: colors.muted,
    fontSize: 12,
  },
  th: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  td: {
    fontSize: 13,
    color: colors.text,
  },
  muted: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 36,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  totalValuePad: {
    marginRight: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dimmed: {
    opacity: 0.5,
  },
  noPointerEvents: {
    // RNW supports pointerEvents in style; cast to any to satisfy TS
    pointerEvents: 'none' as any,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  actionBtnOutline: {
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnOutlineText: {
    color: colors.primary,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnDisabledOutline: {
    opacity: 0.5,
  },
  // New full-width footer bar (web only)
  footerBar: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  footerLogo: {
    height: 32,
    width: 32,
  },
});
