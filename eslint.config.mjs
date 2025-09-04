import { FlatCompat } from '@eslint/eslintrc'
 
const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})
 
const eslintConfig = [
    ...compat.config({
        extends: ['next'],
        rules: {
            // Disable all rules by setting them to 'off'
            // (You may want to keep the extends for parser/plugins, but all rules are off)
            // If you want to remove extends too, just use: rules: {}
            ...Object.fromEntries(
                Object.keys(
                    await import('eslint/conf/eslint-all.js').then(mod => mod.rules)
                ).map(rule => [rule, 'off'])
            ),
        },
    }),
]
 
export default eslintConfig