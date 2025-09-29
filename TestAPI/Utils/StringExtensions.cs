using System.Text;
using System.Text.RegularExpressions;

namespace TestAPI.Utils;

public static class StringExtensions
{
    private static readonly Dictionary<char, string> _accentMap = new()
    {
        { 'a', "[aàáâãäåāą]" },
        { 'e', "[eèéêëēę]" },
        { 'i', "[iìíîïī]" },
        { 'o', "[oòóôõöøōőœ]" },
        { 'u', "[uùúûüūů]" },
        { 'y', "[yýÿ]" },
        { 'n', "[nñń]" },
        { 'c', "[cçćč]" },
        { 's', "[sšśșß]" },
        { 'z', "[zžżź]" },
        { 'd', "[dđð]" },
        { 'l', "[lł]" },
        { 'r', "[rř]" },
        { 't', "[tþ]" },
    };

    /// <summary>
    /// Generates a regex pattern that matches variations of the input text with accented characters.
    /// Example: "cafe" will match "café", "càfe", "cáfe", "câfe", etc.
    /// </summary>
    public static string GetInsensibleRegex(this string text)
    {
        if (string.IsNullOrEmpty(text))
            return string.Empty;

        var pattern = new StringBuilder();

        foreach (char c in text.ToLowerInvariant())
        {
            if (char.IsLetterOrDigit(c))
                pattern.Append(_accentMap.TryGetValue(c, out var variations) ? variations : Regex.Escape(c.ToString()));
            else if (char.IsWhiteSpace(c))
                pattern.Append(@".*");
        }

        return pattern.ToString();
    }

}
