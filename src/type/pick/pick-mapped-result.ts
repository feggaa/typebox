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
import { Pick, type TPick } from './pick'

// ------------------------------------------------------------------
// MappedPickPropertyKey
// ------------------------------------------------------------------
// prettier-ignore
type MappedPickPropertyKey<
  T extends TSchema,
  K extends PropertyKey,
> = {
    [_ in K]: TPick<T, [K]>
  }
// prettier-ignore
function MappedPickPropertyKey<
  T extends TSchema,
  K extends PropertyKey,
>(T: T, K: K): MappedPickPropertyKey<T, K> {
  return {
    [K]: Pick(T, [K])
  } as MappedPickPropertyKey<T, K>
}
// ------------------------------------------------------------------
// MappedPickPropertyKeys
// ------------------------------------------------------------------
// prettier-ignore
type MappedPickPropertyKeys<
  T extends TSchema,
  K extends PropertyKey[]
> = (
    K extends [infer LK extends PropertyKey, ...infer RK extends PropertyKey[]]
    ? MappedPickPropertyKey<T, LK> & MappedPickPropertyKeys<T, RK>
    : {}
  )
// prettier-ignore
function MappedPickPropertyKeys<
  T extends TSchema,
  K extends PropertyKey[]
>(T: T, K: [...K]): MappedPickPropertyKeys<T, K> {
  const [LK, ...RK] = K
  return (
    K.length > 0
      ? { ...MappedPickPropertyKey(T, LK), ...MappedPickPropertyKeys(T, RK) }
      : {}
  ) as MappedPickPropertyKeys<T, K>
}
// ------------------------------------------------------------------
// MappedPickProperties
// ------------------------------------------------------------------
// prettier-ignore
type MappedPickProperties<
  T extends TSchema,
  K extends TMappedKey,
> = (
    MappedPickPropertyKeys<T, K['keys']>
  )
// prettier-ignore
function MappedPickProperties<
  T extends TSchema,
  K extends TMappedKey,
>(T: T, K: K): MappedPickProperties<T, K> {
  return MappedPickPropertyKeys(T, K.keys) as MappedPickProperties<T, K>
}
// ------------------------------------------------------------------
// TPickMappedResult
// ------------------------------------------------------------------
// prettier-ignore
export type TPickMappedResult<
  T extends TSchema,
  K extends TMappedKey,
  P extends TProperties = MappedPickProperties<T, K>
> = (
  TMappedResult<P>
)
// prettier-ignore
export function PickMappedResult<
  T extends TSchema,
  K extends TMappedKey,
  P extends TProperties = MappedPickProperties<T, K>
>(T: T, K: K): TMappedResult<P> {
  const P = MappedPickProperties(T, K) as unknown as P
  return MappedResult(P) 
}
