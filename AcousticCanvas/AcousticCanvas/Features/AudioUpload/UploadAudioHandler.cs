using NAudio.Wave;

namespace AcousticCanvas.Features.AudioUpload;

public class UploadAudioHandler
{
    private const int WaveformResolution = 2000;

    public AudioFileResponse Handle(Stream fileStream, string fileName)
    {
        var fileId = Guid.NewGuid().ToString("N")[..12];
        var tempPath = Path.Combine(Path.GetTempPath(), $"{fileId}_{fileName}");

        using (var fileOutput = File.Create(tempPath))
        {
            fileStream.CopyTo(fileOutput);
        }

        try
        {
            return ProcessAudioFile(tempPath, fileId, fileName);
        }
        finally
        {
            File.Delete(tempPath);
        }
    }

    private static AudioFileResponse ProcessAudioFile(
        string filePath,
        string fileId,
        string fileName)
    {
        using var reader = new AudioFileReader(filePath);

        var sampleRate = reader.WaveFormat.SampleRate;
        var channels = reader.WaveFormat.Channels;
        var durationSeconds = reader.TotalTime.TotalSeconds;

        var waveformData = ExtractWaveformData(reader);

        return new AudioFileResponse(
            fileId,
            fileName,
            durationSeconds,
            sampleRate,
            channels,
            32,
            waveformData
        );
    }

    private static List<WaveformDataPoint> ExtractWaveformData(AudioFileReader reader)
    {
        var waveformData = new List<WaveformDataPoint>();
        var totalSamples = (long)(reader.Length / sizeof(float));
        var samplesPerPoint = totalSamples / WaveformResolution;

        if (samplesPerPoint < 1)
        {
            samplesPerPoint = 1;
        }

        var buffer = new float[samplesPerPoint];
        var samplePosition = 0;
        var timePosition = 0.0;
        var sampleRate = reader.WaveFormat.SampleRate;
        var samplesReadTotal = 0;

        reader.Position = 0;

        while (samplesReadTotal < totalSamples)
        {
            var samplesToRead = (int)Math.Min(buffer.Length, totalSamples - samplesReadTotal);
            var samplesRead = reader.Read(buffer, 0, samplesToRead);

            if (samplesRead == 0)
            {
                break;
            }

            var minAmplitude = float.MaxValue;
            var maxAmplitude = float.MinValue;

            for (var index = 0; index < samplesRead; index++)
            {
                var sample = buffer[index];
                if (sample < minAmplitude)
                {
                    minAmplitude = sample;
                }
                if (sample > maxAmplitude)
                {
                    maxAmplitude = sample;
                }
            }

            if (samplesRead > 0)
            {
                waveformData.Add(new WaveformDataPoint(
                    timePosition,
                    minAmplitude == float.MaxValue ? 0 : minAmplitude,
                    maxAmplitude == float.MinValue ? 0 : maxAmplitude
                ));
            }

            samplesReadTotal += samplesRead;
            samplePosition += samplesRead;
            timePosition = samplePosition / sampleRate;
        }

        return waveformData;
    }
}
