{{- define "common.labels" }}
app: {{ .Chart.Name }}
team: {{ .Values.team }}
slack: {{ .Values.slack }}
type: {{ .Values.type }}
environment: {{ .Values.environment }}
chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
release: {{ .Release.Name }}
heritage: {{ .Release.Service }}
{{- end }}