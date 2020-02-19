import Vue from 'vue'
import { VueConstructor } from 'vue/types/vue'
import { consoleWarn } from '../../util/console'

function generateWarning (child: string, parent: string, nestingOptional?: boolean) {
  if (nestingOptional) return () => {}
  return () => consoleWarn(`The ${child} component must be used inside a ${parent}`)
}

export type Registrable<T extends string, C extends VueConstructor | null = null> = VueConstructor<Vue & {
  [K in T]: C extends VueConstructor ? InstanceType<C> : {
    register (...props: any[]): void
    unregister (self: any): void
  }
}>

export function inject<
  T extends string, C extends VueConstructor | null = null
> (namespace: T, child?: string, parent?: string, nestingOptional?: boolean): Registrable<T, C> {
  const defaultImpl = child && parent ? {
    register: generateWarning(child, parent, nestingOptional),
    unregister: generateWarning(child, parent, nestingOptional),
  } : null

  return Vue.extend({
    name: 'registrable-inject',

    inject: {
      [namespace]: {
        default: defaultImpl,
      },
    },
  })
}

export function provide (namespace: string, self = false) {
  return Vue.extend({
    name: 'registrable-provide',

    methods: self ? {} : {
      register: null,
      unregister: null,
    },
    provide (): object {
      return {
        [namespace]: self ? this : {
          register: this.register,
          unregister: this.unregister,
        },
      }
    },
  })
}
