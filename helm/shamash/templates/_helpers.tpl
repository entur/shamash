{{- define "common.labels" }}
app: {{ .Chart.Name }}
team: {{ .Values.team }}
slack: {{ .Values.slack }}
type: {{ .Values.type }}
environment: {{ .Release.Namespace }}
chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
release: {{ .Release.Name }}
heritage: {{ .Release.Service }}
{{- end }}