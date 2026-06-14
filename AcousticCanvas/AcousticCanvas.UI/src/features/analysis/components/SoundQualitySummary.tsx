import type { JSX } from 'react';
import { Badge, Box, Group, Loader, Stack, Text } from '@mantine/core';
import { IconCheck, IconAlertTriangle, IconX } from '@tabler/icons-react';
import type { SoundQualitySummaryResult } from '../hooks/useSoundQualitySummary';

interface ISoundQualitySummaryProps {
  summary: SoundQualitySummaryResult | null;
  isLoading: boolean;
  error: string | null;
}

export const SoundQualitySummary = ({ summary, isLoading, error }: ISoundQualitySummaryProps): JSX.Element => {
  if (isLoading) {
    return (
      <Box p="xs">
        <Group justify="center">
          <Loader size="xs" color="teal" />
          <Text size="xs" c="dimmed">Loading sound quality summary...</Text>
        </Group>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="xs">
        <Text size="xs" c="red">{error}</Text>
      </Box>
    );
  }

  if (!summary) {
    return (
      <Box p="xs">
        <Text size="xs" c="dimmed">No sound quality summary available</Text>
      </Box>
    );
  }

  const assessmentColor = summary.overallAssessment === 'Good' ? 'teal' : summary.overallAssessment === 'Fair' ? 'yellow' : 'red';
  const assessmentIcon = summary.overallAssessment === 'Good' ? <IconCheck size={16} /> : summary.overallAssessment === 'Fair' ? <IconAlertTriangle size={16} /> : <IconX size={16} />;

  return (
    <Stack gap="xs" p="xs">
      <Group justify="space-between" align="center">
        <Text size="xs" fw={600} c="dimmed">Overall Assessment</Text>
        <Badge size="sm" color={assessmentColor} variant="light" leftSection={assessmentIcon}>
          {summary.overallAssessment}
        </Badge>
      </Group>

      <Box>
        <Text size="xs" fw={600} c="dimmed" mb={2}>Key Findings</Text>
        <Stack gap={2}>
          {summary.keyFindings.map((finding, index) => (
            <Text key={index} size="xs" c="dimmed" style={{ paddingLeft: '6px', borderLeft: '2px solid var(--mantine-color-teal-4)' }}>
              {finding}
            </Text>
          ))}
        </Stack>
      </Box>

      <Box>
        <Text size="xs" fw={600} c="dimmed" mb={2}>Top Metrics</Text>
        <Stack gap={2}>
          {summary.topMetrics.map((metric) => (
            <Group key={metric.name} justify="space-between" align="center">
              <Text size="xs" c="dimmed">{metric.name}</Text>
              <Group gap={4}>
                <Text size="xs" fw={500} ff="var(--font-mono)">
                  {metric.value.toFixed(2)} {metric.unit}
                </Text>
                <Badge size="xs" color={metric.assessment === 'Good' ? 'teal' : metric.assessment === 'Fair' ? 'yellow' : 'red'} variant="light">
                  {metric.assessment}
                </Badge>
              </Group>
            </Group>
          ))}
        </Stack>
      </Box>

      <Box>
        <Text size="xs" fw={600} c="dimmed" mb={2}>Recommendations</Text>
        <Stack gap={2}>
          {summary.recommendations.map((recommendation, index) => (
            <Text key={index} size="xs" c="dimmed" style={{ paddingLeft: '6px', borderLeft: '2px solid var(--mantine-color-blue-4)' }}>
              {recommendation}
            </Text>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};
