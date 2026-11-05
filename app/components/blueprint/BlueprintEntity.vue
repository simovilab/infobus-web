<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Data entity in <source>.<field> notation, e.g. routes.route_short_name */
  entity: string
  /** Single-line, uniform size; for table cells and other tight spots. */
  compact?: boolean
}>(), {
  compact: false
})

type Kind = 'heading' | 'subheading' | 'body' | 'identifier' | 'color' | 'link' | 'time' | 'number' | 'flag' | 'text'

const rules: [Kind, RegExp][] = [
  ['body', /^tts_/],
  ['heading', /^(title|header|headline|label|name|header_text|tts_header_text)$|_short_name$|^(stop|fare_product|rider_category|fare_media)_name$/],
  ['subheading', /_long_name$|headsign$|^(agency|network|area|first_stop|last_stop)_name$|^effect$|^cause$/],
  ['body', /^(body|description|description_text|tts_description_text)$|_desc$|_detail$|_text$/],
  ['identifier', /(^|_)id$|^slug$|_code$|^parent_station$|^kind$|_state$|_relationship$|_reason$|^status$/],
  ['color', /color$/],
  ['link', /url$|^(src|path|to)$/],
  ['time', /_time$|_date$|^(date|timestamp|start|end|time|delay|uncertainty)$|_at$|_window$/],
  ['number', /_lat$|_lon$|_secs$|_sequence$|_count$|^(amount|currency|latitude|longitude|bearing|rule_priority|transfer_count|duration_limit|travel_time_to_stop)$|percentage$|_factor$|_offset$|_order$/],
  ['flag', /^is_|_support$|_allowed$|^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|saved|exact_times|timepoint|wheelchair_accessible|wheelchair_boarding|affects_passenger_stops)$|_type$/]
]

const field = computed(() => props.entity.split('.').at(-1) ?? props.entity)
const kind = computed<Kind>(() => rules.find(([, pattern]) => pattern.test(field.value))?.[0] ?? 'text')

const compactClasses: Record<Kind, string> = {
  heading: 'font-semibold text-highlighted',
  subheading: 'font-medium text-toned',
  body: 'text-muted',
  identifier: 'font-mono text-dimmed',
  color: 'font-mono text-dimmed',
  link: 'text-primary underline underline-offset-2',
  time: 'font-mono tabular-nums text-toned',
  number: 'font-mono tabular-nums text-muted',
  flag: 'text-muted',
  text: 'text-toned'
}

const classes: Record<Kind, string> = {
  heading: 'basis-full text-xl font-semibold text-highlighted',
  subheading: 'basis-full text-base font-medium text-toned',
  body: 'basis-full text-sm text-muted',
  identifier: 'font-mono text-xs text-dimmed',
  color: 'font-mono text-xs text-dimmed',
  link: 'text-sm text-primary underline underline-offset-2',
  time: 'font-mono text-sm tabular-nums text-toned',
  number: 'font-mono text-sm tabular-nums text-muted',
  flag: 'text-xs text-muted',
  text: 'text-sm text-toned'
}
</script>

<template>
  <span
    class="inline-flex min-w-0 max-w-full items-center gap-1"
    :class="compact ? ['text-sm whitespace-nowrap', compactClasses[kind]] : ['wrap-anywhere', classes[kind]]"
    :title="entity"
  >
    <span
      v-if="kind === 'color'"
      class="inline-block size-3 shrink-0 rounded-sm bg-accented ring-1 ring-default"
    />
    <UIcon
      v-if="kind === 'flag'"
      name="i-lucide-toggle-left"
      class="size-3.5 shrink-0"
    />
    <UIcon
      v-if="kind === 'link'"
      name="i-lucide-link"
      class="size-3.5 shrink-0"
    />
    <span>{{ entity }}</span>
  </span>
</template>
