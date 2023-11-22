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
import type { TProperties } from '../object/index'
import type { Assert } from '../helpers/index'
import { MappedResult, type TMappedResult, type TMappedKey } from '../mapped/index'
import { Literal, TLiteral, TLiteralValue } from '../literal/index'
import { Extends, type TExtends } from './extends'

// ------------------------------------------------------------------
// MappedExtendsPropertyKey
// ------------------------------------------------------------------
// prettier-ignore
type MappedExtendsPropertyKey<
  K extends PropertyKey,
  U extends TSchema,
  L extends TSchema,
  R extends TSchema
> = {
    [_ in K]: TExtends<TLiteral<Assert<K, TLiteralValue>>, U, L, R>
  }
// prettier-ignore
function MappedExtendsPropertyKey<
  K extends PropertyKey,
  U extends TSchema,
  L extends TSchema,
  R extends TSchema
>(K: K, U: U, L: L, R: R): MappedExtendsPropertyKey<K, U, L, R> {
  return {
    [K]: Extends(Literal(K as any), U, L, R) as any
  } as MappedExtendsPropertyKey<K, U, L, R>
}
// ------------------------------------------------------------------
// MappedExtendsPropertyKeys
// ------------------------------------------------------------------
// prettier-ignore
type MappedExtendsPropertyKeys<
  K extends PropertyKey[],
  U extends TSchema,
  L extends TSchema,
  R extends TSchema
> = (
    K extends [infer LK extends PropertyKey, ...infer RK extends PropertyKey[]]
    ? MappedExtendsPropertyKey<LK, U, L, R> & MappedExtendsPropertyKeys<RK, U, L, R>
    : {}
  )
// prettier-ignore
function MappedExtendsPropertyKeys<
  K extends PropertyKey[],
  U extends TSchema,
  L extends TSchema,
  R extends TSchema
>(K: [...K], U: U, L: L, R: R): MappedExtendsPropertyKeys<K, U, L, R> {
  const [LK, ...RK] = K
  return (
    K.length > 0
      ? { ...MappedExtendsPropertyKey(LK, U, L, R), ...MappedExtendsPropertyKeys(RK, U, L, R) }
      : {}
  ) as MappedExtendsPropertyKeys<K, U, L, R>
}
// ------------------------------------------------------------------
// MappedExtendsProperties
// ------------------------------------------------------------------
// prettier-ignore
type MappedExtendsProperties<
  K extends TMappedKey,
  U extends TSchema,
  L extends TSchema,
  R extends TSchema
> = (
    MappedExtendsPropertyKeys<K['keys'], U, L, R>
  )
// prettier-ignore
function MappedExtendsProperties<
  K extends TMappedKey,
  U extends TSchema,
  L extends TSchema,
  R extends TSchema
>(K: K, U: U, L: L, R: R): MappedExtendsProperties<K, U, L, R> {
  return MappedExtendsPropertyKeys(K.keys, U, L, R) as MappedExtendsProperties<K, U, L, R>
}
// ------------------------------------------------------------------
// TExtendsMappedResult
// ------------------------------------------------------------------
// prettier-ignore
export type TExtendsMappedResult<
  T extends TMappedKey,
  U extends TSchema,
  L extends TSchema,
  R extends TSchema,
  P extends TProperties = MappedExtendsProperties<T, U, L, R>
> = (
  TMappedResult<P>
)
// prettier-ignore
export function ExtendsMappedResult<
  T extends TMappedKey,
  U extends TSchema,
  L extends TSchema,
  R extends TSchema,
  P extends TProperties = MappedExtendsProperties<T, U, L, R>
>(T: T, U: U, L: L, R: R): TMappedResult<P> {
  const P = MappedExtendsProperties(T, U, L, R) as unknown as P
  return MappedResult(P) 
}
