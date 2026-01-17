/**
 * Static imports for common locales to ensure they're bundled
 * This file provides pre-imported CLDR data for the most common locales
 */

// English
import enNumbers from 'cldr-numbers-full/main/en/numbers.json'
import enCurrencies from 'cldr-numbers-full/main/en/currencies.json'
import enDates from 'cldr-dates-full/main/en/ca-gregorian.json'
import enLocaleNames from 'cldr-localenames-full/main/en/languages.json'

// German
import deNumbers from 'cldr-numbers-full/main/de/numbers.json'
import deCurrencies from 'cldr-numbers-full/main/de/currencies.json'
import deDates from 'cldr-dates-full/main/de/ca-gregorian.json'
import deLocaleNames from 'cldr-localenames-full/main/de/languages.json'

// French
import frNumbers from 'cldr-numbers-full/main/fr/numbers.json'
import frCurrencies from 'cldr-numbers-full/main/fr/currencies.json'
import frDates from 'cldr-dates-full/main/fr/ca-gregorian.json'
import frLocaleNames from 'cldr-localenames-full/main/fr/languages.json'

// Spanish
import esNumbers from 'cldr-numbers-full/main/es/numbers.json'
import esCurrencies from 'cldr-numbers-full/main/es/currencies.json'
import esDates from 'cldr-dates-full/main/es/ca-gregorian.json'
import esLocaleNames from 'cldr-localenames-full/main/es/languages.json'

// Italian
import itNumbers from 'cldr-numbers-full/main/it/numbers.json'
import itCurrencies from 'cldr-numbers-full/main/it/currencies.json'
import itDates from 'cldr-dates-full/main/it/ca-gregorian.json'
import itLocaleNames from 'cldr-localenames-full/main/it/languages.json'

// Japanese
import jaNumbers from 'cldr-numbers-full/main/ja/numbers.json'
import jaCurrencies from 'cldr-numbers-full/main/ja/currencies.json'
import jaDates from 'cldr-dates-full/main/ja/ca-gregorian.json'
import jaLocaleNames from 'cldr-localenames-full/main/ja/languages.json'

// Chinese Simplified
import zhHansNumbers from 'cldr-numbers-full/main/zh-Hans/numbers.json'
import zhHansCurrencies from 'cldr-numbers-full/main/zh-Hans/currencies.json'
import zhHansDates from 'cldr-dates-full/main/zh-Hans/ca-gregorian.json'
import zhHansLocaleNames from 'cldr-localenames-full/main/zh-Hans/languages.json'

// Korean
import koNumbers from 'cldr-numbers-full/main/ko/numbers.json'
import koCurrencies from 'cldr-numbers-full/main/ko/currencies.json'
import koDates from 'cldr-dates-full/main/ko/ca-gregorian.json'
import koLocaleNames from 'cldr-localenames-full/main/ko/languages.json'

// Arabic
import arNumbers from 'cldr-numbers-full/main/ar/numbers.json'
import arCurrencies from 'cldr-numbers-full/main/ar/currencies.json'
import arDates from 'cldr-dates-full/main/ar/ca-gregorian.json'
import arLocaleNames from 'cldr-localenames-full/main/ar/languages.json'

// Russian
import ruNumbers from 'cldr-numbers-full/main/ru/numbers.json'
import ruCurrencies from 'cldr-numbers-full/main/ru/currencies.json'
import ruDates from 'cldr-dates-full/main/ru/ca-gregorian.json'
import ruLocaleNames from 'cldr-localenames-full/main/ru/languages.json'

// Portuguese
import ptNumbers from 'cldr-numbers-full/main/pt/numbers.json'
import ptCurrencies from 'cldr-numbers-full/main/pt/currencies.json'
import ptDates from 'cldr-dates-full/main/pt/ca-gregorian.json'
import ptLocaleNames from 'cldr-localenames-full/main/pt/languages.json'

// Hindi
import hiNumbers from 'cldr-numbers-full/main/hi/numbers.json'
import hiCurrencies from 'cldr-numbers-full/main/hi/currencies.json'
import hiDates from 'cldr-dates-full/main/hi/ca-gregorian.json'
import hiLocaleNames from 'cldr-localenames-full/main/hi/languages.json'

// Turkish
import trNumbers from 'cldr-numbers-full/main/tr/numbers.json'
import trCurrencies from 'cldr-numbers-full/main/tr/currencies.json'
import trDates from 'cldr-dates-full/main/tr/ca-gregorian.json'
import trLocaleNames from 'cldr-localenames-full/main/tr/languages.json'

// Polish
import plNumbers from 'cldr-numbers-full/main/pl/numbers.json'
import plCurrencies from 'cldr-numbers-full/main/pl/currencies.json'
import plDates from 'cldr-dates-full/main/pl/ca-gregorian.json'
import plLocaleNames from 'cldr-localenames-full/main/pl/languages.json'

// Core data
import availableLocales from 'cldr-core/availableLocales.json'

export const localeData = {
  numbers: {
    en: enNumbers,
    de: deNumbers,
    fr: frNumbers,
    es: esNumbers,
    it: itNumbers,
    ja: jaNumbers,
    'zh-Hans': zhHansNumbers,
    ko: koNumbers,
    ar: arNumbers,
    ru: ruNumbers,
    pt: ptNumbers,
    hi: hiNumbers,
    tr: trNumbers,
    pl: plNumbers,
  },
  currencies: {
    en: enCurrencies,
    de: deCurrencies,
    fr: frCurrencies,
    es: esCurrencies,
    it: itCurrencies,
    ja: jaCurrencies,
    'zh-Hans': zhHansCurrencies,
    ko: koCurrencies,
    ar: arCurrencies,
    ru: ruCurrencies,
    pt: ptCurrencies,
    hi: hiCurrencies,
    tr: trCurrencies,
    pl: plCurrencies,
  },
  dates: {
    en: enDates,
    de: deDates,
    fr: frDates,
    es: esDates,
    it: itDates,
    ja: jaDates,
    'zh-Hans': zhHansDates,
    ko: koDates,
    ar: arDates,
    ru: ruDates,
    pt: ptDates,
    hi: hiDates,
    tr: trDates,
    pl: plDates,
  },
  localeNames: {
    en: enLocaleNames,
    de: deLocaleNames,
    fr: frLocaleNames,
    es: esLocaleNames,
    it: itLocaleNames,
    ja: jaLocaleNames,
    'zh-Hans': zhHansLocaleNames,
    ko: koLocaleNames,
    ar: arLocaleNames,
    ru: ruLocaleNames,
    pt: ptLocaleNames,
    hi: hiLocaleNames,
    tr: trLocaleNames,
    pl: plLocaleNames,
  },
  core: {
    availableLocales,
  },
}
