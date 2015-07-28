var kudzu = (function() {
    function Player() {
	this.goats = [new Goat()];
    }

    function Goat() {
	this.gender = (Math.random() > 0.5 ? "F" : "M");
	this.maxHunger = 50 + (Math.random() * 50);
	this.name = (this.gender == "M" ? "Billy" : "Nanny"); // TODO: expand possibilities
	this.pickiness = 50 + (Math.random() * 50);
	this.wanderLust = 0; // For future use
    };

    function Kudzu() {
	this.desirability = 88;
	this.name = "kudzu";
	this.nourishment = 1;
	this.prominence = 80;
    };

    function Knapweed() {
	this.desirability = 87;
	this.name = "knapweed";
	this.nourishment = 0.8;
	this.prominence = 80;
    };

    return {
	Player: Player;
    }
})();
