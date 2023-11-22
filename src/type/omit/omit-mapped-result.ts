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
import { MappedResult, type TMappedResult, type TMappedKey } from '../mapped/index'
import { Omit, type TOmit } from './omit'

// ------------------------------------------------------------------
// MappedOmitPropertyKey
// ------------------------------------------------------------------
// prettier-ignore
type MappedOmitPropertyKey<
  T extends TSchema,
  K extends PropertyKey,
> = {
    [_ in K]: TOmit<T, [K]>
  }
// prettier-ignore
function MappedOmitPropertyKey<
  T extends TSchema,
  K extends PropertyKey,
>(T: T, K: K): MappedOmitPropertyKey<T, K> {
  return {
    [K]: Omit(T, [K])
  } as MappedOmitPropertyKey<T, K>
}
// ------------------------------------------------------------------
// MappedOmitPropertyKeys
// ------------------------------------------------------------------
// prettier-ignore
type MappedOmitPropertyKeys<
  T extends TSchema,
  K extends PropertyKey[]
> = (
    K extends [infer LK extends PropertyKey, ...infer RK extends PropertyKey[]]
    ? MappedOmitPropertyKey<T, LK> & MappedOmitPropertyKeys<T, RK>
    : {}
  )
// prettier-ignore
function MappedOmitPropertyKeys<
  T extends TSchema,
  K extends PropertyKey[]
>(T: T, K: [...K]): MappedOmitPropertyKeys<T, K> {
  const [LK, ...RK] = K
  return (
    K.length > 0
      ? { ...MappedOmitPropertyKey(T, LK), ...MappedOmitPropertyKeys(T, RK) }
      : {}
  ) as MappedOmitPropertyKeys<T, K>
}
// ------------------------------------------------------------------
// MappedOmitProperties
// ------------------------------------------------------------------
// prettier-ignore
type MappedOmitProperties<
  T extends TSchema,
  K extends TMappedKey,
> = (
    MappedOmitPropertyKeys<T, K['keys']>
  )
// prettier-ignore
function MappedOmitProperties<
  T extends TSchema,
  K extends TMappedKey,
>(T: T, K: K): MappedOmitProperties<T, K> {
  return MappedOmitPropertyKeys(T, K.keys) as MappedOmitProperties<T, K>
}
// ------------------------------------------------------------------
// TOmitMappedResult
// ------------------------------------------------------------------
// prettier-ignore
export type TOmitMappedResult<
  T extends TSchema,
  K extends TMappedKey,
  P extends TProperties = MappedOmitProperties<T, K>
> = (
  TMappedResult<P>
)
// prettier-ignore
export function OmitMappedResult<
  T extends TSchema,
  K extends TMappedKey,
  P extends TProperties = MappedOmitProperties<T, K>
>(T: T, K: K): TMappedResult<P> {
  const P = MappedOmitProperties(T, K) as unknown as P
  return MappedResult(P) 
}
