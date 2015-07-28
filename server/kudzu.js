var kudzu = (function() {
    function Goat() {
	this.gender = (Math.random() > 0.5 ? "F" : "M");
	this.maxHunger = 50 + (Math.random() * 50);
	this.pickiness = 50 + (Math.random() * 50);
	this.wanderLust = 0; // For future use
    };

    function Kudzu() {
	this.desirability = 88;
	this.nourishment = 1;
	this.prominence = 80;
    };

    function Knapweed() {
	this.desirability = 87;
	this.nourishment = 0.8;
	this.prominence = 80;
    }
	
})();
