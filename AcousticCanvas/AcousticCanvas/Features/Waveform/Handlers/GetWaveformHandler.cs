using AcousticCanvas.Features.Waveform.Commands;
using FastEndpoints;
using NAudio.Wave;

namespace AcousticCanvas.Features.Waveform.Handlers;

public class GetWaveformHandler : CommandHandler<GetWaveformQuery, WaveformResult>
{
    public override Task<WaveformResult> ExecuteAsync(GetWaveformQuery query, CancellationToken ct)
    {
        if (!File.Exists(query.FilePath))
        {
            throw new FileNotFoundException($"Audio file not found: {query.FilePath}");
        }

        var metadata = ReadFileMetadata(query.FilePath);

        if (metadata.TotalSamples == 0)
        {
            throw new InvalidOperationException("Audio file contains no samples.");
        }

        var peaks = ExtractBucketPeaks(query.FilePath, metadata, query.Points);

        if (peaks.Length == 0)
        {
            throw new InvalidOperationException("No waveform buckets could be extracted.");
        }

        var peaksInPa = ConvertSamplesToPascals(peaks);
        var globalMinPa = ComputeGlobalMin(peaksInPa);
        var globalMaxPa = ComputeGlobalMax(peaksInPa);

        var result = new WaveformResult(
            metadata.DurationSeconds,
            metadata.SampleRate,
            metadata.Channels,
            Math.Round(globalMinPa, 6),
            Math.Round(globalMaxPa, 6),
            peaksInPa
        );

        return Task.FromResult(result);
    }

    private static AudioMetadata ReadFileMetadata(string filePath)
    {
        using var reader = new AudioFileReader(filePath);

        var sampleRate = reader.WaveFormat.SampleRate;
        var channels = reader.WaveFormat.Channels;
        var durationSeconds = reader.TotalTime.TotalSeconds;
        var totalSamples = (long)(durationSeconds * sampleRate * channels);

        return new AudioMetadata(sampleRate, channels, durationSeconds, totalSamples);
    }

    private static float[] ExtractBucketPeaks(
        string filePath,
        AudioMetadata metadata,
        int targetPoints
    )
    {
        var samplesPerBucket = (int)
            Math.Max(1, metadata.TotalSamples / targetPoints / metadata.Channels);
        var readBuffer = new float[samplesPerBucket * metadata.Channels];
        var peaksInterleaved = new List<float>(targetPoints * 2);

        using var reader = new AudioFileReader(filePath);

        while (true)
        {
            var samplesRead = reader.Read(readBuffer, 0, readBuffer.Length);
            if (samplesRead == 0)
            {
                break;
            }

            var bucketMin = ComputeBucketMin(readBuffer, samplesRead);
            var bucketMax = ComputeBucketMax(readBuffer, samplesRead);

            peaksInterleaved.Add(bucketMin);
            peaksInterleaved.Add(bucketMax);
        }

        return peaksInterleaved.ToArray();
    }

    private static float ComputeBucketMin(float[] buffer, int count)
    {
        var min = float.MaxValue;
        for (var index = 0; index < count; index++)
        {
            if (buffer[index] < min)
                min = buffer[index];
        }
        return min == float.MaxValue ? 0f : min;
    }

    private static float[] ConvertSamplesToPascals(float[] samples)
    {
        // Calibration: 0 dBFS = 91 dB SPL, where FS = 1 Pa (peak)
        // Conversion: multiply digital samples by 1.0 to get Pa
        const double pascalsPerFullScale = 1.0;
        var result = new float[samples.Length];
        for (var index = 0; index < samples.Length; index++)
        {
            result[index] = (float)(samples[index] * pascalsPerFullScale);
        }
        return result;
    }

    private static float ComputeBucketMax(float[] buffer, int count)
    {
        var max = float.MinValue;
        for (var index = 0; index < count; index++)
        {
            if (buffer[index] > max)
                max = buffer[index];
        }
        return max == float.MinValue ? 0f : max;
    }

    private static float ComputeGlobalMin(float[] peaks)
    {
        var min = float.MaxValue;
        for (var index = 0; index < peaks.Length; index += 2)
        {
            if (peaks[index] < min)
                min = peaks[index];
        }
        return min == float.MaxValue ? 0f : min;
    }

    private static float ComputeGlobalMax(float[] peaks)
    {
        var max = float.MinValue;
        for (var index = 1; index < peaks.Length; index += 2)
        {
            if (peaks[index] > max)
                max = peaks[index];
        }
        return max == float.MinValue ? 0f : max;
    }
}

internal record AudioMetadata(
    int SampleRate,
    int Channels,
    double DurationSeconds,
    long TotalSamples
);
