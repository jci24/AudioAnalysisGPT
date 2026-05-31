using AcousticCanvas.Features.Analysis.Domain;

namespace AcousticCanvas.Features.Analysis.Importers;

public interface ISignalFileImporter
{
    // Returns true if this importer can handle the given file path/extension.
    bool CanImport(string filePath);

    // Reads the file and returns a generic SignalFile with fully populated channels.
    SignalFile Import(string filePath);
}
