import { describe, expect, it } from 'vitest'
import { isCalm, isPolitical, scoreText } from './filters'

describe('calm filter', () => {
  it('keeps calm titles', () => {
    expect(isCalm('How tides work: a clear visual explanation', '', 'balanced')).toBe(true)
    expect(isCalm('Una biblioteca de Valencia presta herramientas a sus vecinos', '', 'balanced')).toBe(true)
    expect(isCalm('Com funcionen les marees', '', 'strict')).toBe(true)
  })
  it('hides drama and clickbait in ES / EN / CA', () => {
    expect(isCalm('YOU WON’T BELIEVE what happened!!!', '', 'balanced')).toBe(false)
    expect(isCalm('El ZASCA de la semana: polémica en directo', '', 'balanced')).toBe(false)
    expect(isCalm('La xafarderia del dia: baralla brutal', '', 'balanced')).toBe(false)
  })
  it('respects blocked words anywhere', () => {
    expect(scoreText('A nice video', 'some salseo inside', ['salseo']).blocked).toBe(true)
  })
  it('strictness changes the outcome', () => {
    const t = 'The truth about sleep'
    expect(isCalm(t, '', 'relaxed')).toBe(true)
    expect(isCalm(t, '', 'strict')).toBe(false)
  })
})

describe('politics filter', () => {
  it('detects politics in ES / EN / CA', () => {
    expect(isPolitical('El Gobierno aprueba una nueva ley')).toBe(true)
    expect(isPolitical('Parliament votes on the budget')).toBe(true)
    expect(isPolitical('El Parlament debat la llei')).toBe(true)
    expect(isPolitical('Acuerdo entre el PSOE y Junts')).toBe(true)
  })
  it('does not trigger on ordinary words', () => {
    expect(isPolitical('Podemos aprender de los pulpos')).toBe(false)
    expect(isPolitical('Cómo sumar fracciones sin miedo')).toBe(false)
    expect(isPolitical('A happy app for plants')).toBe(false)
    expect(isPolitical('Una nueva vacuna contra la malaria')).toBe(false)
  })
})
