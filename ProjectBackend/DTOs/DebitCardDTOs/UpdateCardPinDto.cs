namespace ProjectBackend.DTOs.DebitCardDTOs
{
    public record UpdateCardPinDto
    {
        public string NewPIN { get; init; } = string.Empty;
    }
}