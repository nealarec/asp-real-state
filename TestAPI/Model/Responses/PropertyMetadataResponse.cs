using System;

namespace TestAPI.Model.Responses
{
    public class PropertyMetadataResponse
    {
        public required PriceRange PriceRange { get; set; }
        public required YearRange YearRange { get; set; }
        public int TotalProperties { get; set; }
    }

    public class PriceRange
    {
        public decimal Min { get; set; }
        public decimal Max { get; set; }
        public decimal Average { get; set; }
    }

    public class YearRange
    {
        public int Min { get; set; }
        public int Max { get; set; }
    }
}
