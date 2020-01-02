export default {
    props: ["name"],
    computed: {
        title: function () {
            return "Welcome, " + this.name;
        }
    }
};

