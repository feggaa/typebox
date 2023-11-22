/*--------------------------------------------------------------------------

@sinclair/typebox/type

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import type { TSchema } from '../schema/index'
import { TemplateLiteral, TemplateLiteralParseExact, IsTemplateLiteralFinite, TemplateLiteralGenerate, type TTemplateLiteral, type TTemplateLiteralKind } from '../template-literal/index'
import { IntrinsicMappedResult, type TIntrinsicMappedResult } from './intrinsic-mapped-result'
import { Literal, type TLiteral, type TLiteralValue } from '../literal/index'
import { Union, type TUnion } from '../union/index'
import { type TMappedKey } from '../mapped/index'

// prettier-ignore
import { 
  TMappedKey as IsMappedKeyType,
  TTemplateLiteral as IsTemplateLiteralType, 
  TUnion as IsUnionType, 
  TLiteral as IsLiteralType 
} from '../guard/type'

// ------------------------------------------------------------------
// Apply
// ------------------------------------------------------------------
function ApplyUncapitalize(value: string): string {
  const [first, rest] = [value.slice(0, 1), value.slice(1)]
  return [first.toLowerCase(), rest].join('')
}
function ApplyCapitalize(value: string): string {
  const [first, rest] = [value.slice(0, 1), value.slice(1)]
  return [first.toUpperCase(), rest].join('')
}
function ApplyUppercase(value: string): string {
  return value.toUpperCase()
}
function ApplyLowercase(value: string): string {
  return value.toLowerCase()
}
// ------------------------------------------------------------------
// IntrinsicMode
// ------------------------------------------------------------------
export type IntrinsicMode = 'Uppercase' | 'Lowercase' | 'Capitalize' | 'Uncapitalize'
// ------------------------------------------------------------------
// FromTemplateLiteral
// ------------------------------------------------------------------
// prettier-ignore
type FromTemplateLiteral<T extends TTemplateLiteralKind[], M extends IntrinsicMode> =
  M extends IntrinsicMode ?
    T extends [infer L extends TTemplateLiteralKind, ...infer R extends TTemplateLiteralKind[]]
      ? [TIntrinsic<L, M>, ...FromTemplateLiteral<R, M>]
      : T
    : T
function FromTemplateLiteral<T extends TTemplateLiteralKind[], M extends IntrinsicMode>(schema: TTemplateLiteral, mode: IntrinsicMode): FromTemplateLiteral<T, M> {
  // note: template literals require special runtime handling as they are encoded in string patterns.
  // This diverges from the mapped type which would otherwise map on the template literal kind.
  const expression = TemplateLiteralParseExact(schema.pattern)
  const finite = IsTemplateLiteralFinite(expression)
  if (!finite) return { ...schema, pattern: FromLiteralValue(schema.pattern, mode) } as any
  const strings = [...TemplateLiteralGenerate(expression)]
  const literals = strings.map((value) => Literal(value))
  const mapped = FromRest(literals as any, mode)
  const union = Union(mapped)
  return TemplateLiteral([union]) as unknown as FromTemplateLiteral<T, M>
}
// ------------------------------------------------------------------
// FromLiteralValue
// ------------------------------------------------------------------
// prettier-ignore
type FromLiteralValue<T, M extends IntrinsicMode> = (
    T extends string ?
      M extends 'Uncapitalize' ? Uncapitalize<T> :
      M extends 'Capitalize' ? Capitalize<T> :
      M extends 'Uppercase' ? Uppercase<T> :
      M extends 'Lowercase' ? Lowercase<T> :
      string
    : T
)
// prettier-ignore
function FromLiteralValue(value: TLiteralValue, mode: IntrinsicMode) {
  return (
    typeof value === 'string' ? (
      mode === 'Uncapitalize' ? ApplyUncapitalize(value) :
      mode === 'Capitalize' ? ApplyCapitalize(value) :
      mode === 'Uppercase' ? ApplyUppercase(value) :
      mode === 'Lowercase' ? ApplyLowercase(value) :
      value
    ) : value.toString()
  )
}
// ------------------------------------------------------------------
// FromRest
// ------------------------------------------------------------------
// prettier-ignore
type FromRest<T extends TSchema[], M extends IntrinsicMode> =
  T extends [infer L extends TSchema, ...infer R extends TSchema[]]
  ? [TIntrinsic<L, M>, ...FromRest<R, M>]
  : []
function FromRest<T extends TSchema[], M extends IntrinsicMode>(T: [...T], mode: M): FromRest<T, M> {
  const [L, ...R] = T
  return (T.length > 0 ? [Intrinsic(L, mode), ...FromRest(R, mode)] : []) as FromRest<T, M>
}
// ------------------------------------------------------------------
// TIntrinsic
// ------------------------------------------------------------------
// prettier-ignore
export type TIntrinsic<T extends TSchema, M extends IntrinsicMode> =
  // Intrinsic-Mapped-Inference
  T extends TMappedKey ? TIntrinsicMappedResult<T, M> :
  // Standard-Inference
  T extends TTemplateLiteral<infer S> ? TTemplateLiteral<FromTemplateLiteral<S, M>> :
  T extends TUnion<infer S> ? TUnion<FromRest<S, M>> :
  T extends TLiteral<infer S> ? TLiteral<FromLiteralValue<S, M>> :
  T
/** Applies an intrinsic string manipulation to the given type. */
export function Intrinsic<T extends TMappedKey, M extends IntrinsicMode>(schema: T, mode: M): TIntrinsicMappedResult<T, M>
/** Applies an intrinsic string manipulation to the given type. */
export function Intrinsic<T extends TSchema, M extends IntrinsicMode>(schema: T, mode: M): TIntrinsic<T, M>
/** Applies an intrinsic string manipulation to the given type. */
export function Intrinsic(schema: TSchema, mode: IntrinsicMode): any {
  // prettier-ignore
  return (
    // Intrinsic-Mapped-Inference
    IsMappedKeyType(schema) ?  IntrinsicMappedResult(schema, mode) :
    // Standard-Inference
    IsTemplateLiteralType(schema) ? FromTemplateLiteral(schema, mode) :
    IsUnionType(schema) ? Union(FromRest(schema.anyOf, mode)) :
    IsLiteralType(schema) ? Literal(FromLiteralValue(schema.const, mode)) :
    schema
  )
}
