// small jest test
import {describe, it} from '@jest/globals';
import {HtmlGenerator, HtmlTemplatesEnum} from "../../helpers/html/HtmlGenerator";
import {EmojiHelper} from "../../helpers/EmojiHelper";
import {
    ReportCanteenEntryLabelsType,
    ReportCanteenEntryType,
    ReportFoodEntryLabelType,
    ReportFoodEntryType,
    ReportGenerator,
    ReportStatusTrafficLightValues,
    ReportType
} from "../ReportGenerator";
import {TestArtifacts} from "../../helpers/TestArtifacts";
import {MailHelper} from "../../helpers/mail/MailHelper";
import {MyDatabaseTestableHelper} from "../../helpers/MyDatabaseHelperInterface";

describe("Food Feedback Html Template", () => {

    it("ReferenceDate on same Date", async () => {

        const canteenFeedbackLabels = ["Ich habe heute Zeit in die Mensa zu gehen", "Heute ist ein  passendes Fleischgericht für mich dabei", "Heute ist ein  passendes vegetarisches Gericht für mich dabei"]
        const foodFeedbackLabels = ["Geschmack", "Optik", "Größe", "Preis"]
        const foodNames = ["Frittiertes von der Kartoffel - kleine Portion", "Black Bean Burger Classic mit Pommes", "Kartoffelgratin mit Salat", "Kartoffelgratin mit Salat", "Kartoffelgratin mit Salat"]
        const foodComments = ["Sehr lecker", "Der Preis ist ja mal viel zu teuer, als was soll sowas", "Das war ja mal gar nichts", "Das war ja mal gar nichts", "Das war ja mal gar nichts"]
        const canteenNames = ["Mensa Zentralstraße", "Mensa Kleine Pause", "Mensa auf dem Berg", "Weitere Mensa"];

        function getRatingValues(index: number){
            // return amount_positive_new, amount_negative_new, amount_total, amount_negative, amount_positive, status_total, status_new
            // i modulo 3
            // i = 0; good with around 90%
            // i = 1; bad with around 10%
            // i = 2; mixed with around 50%
            let amount_positive_new = 0;
            let amount_negative_new = 0;
            let amount_negative = 0;
            let amount_positive = 0;
            let status_total = "";
            let status_new = "";
            switch(index % 4){
                case 0:
                    amount_positive_new = 90;
                    amount_negative_new = 10;
                    amount_negative = 10;
                    amount_positive = 90;
                    status_total = "good";
                    status_new = "good";
                    break;
                case 1:
                    amount_positive_new = 10;
                    amount_negative_new = 90;
                    amount_negative = 90;
                    amount_positive = 10;
                    status_total = "bad";
                    status_new = "bad";
                    break;
                case 2:
                    amount_positive_new = 50;
                    amount_negative_new = 50;
                    amount_negative = 50;
                    amount_positive = 50;
                    status_total = "mixed";
                    status_new = "mixed";
                    break;
                case 3:
                    amount_positive_new = 0;
                    amount_negative_new = 0;
                    amount_negative = 0;
                    amount_positive = 0;
                    status_total = "empty";
                    status_new = "empty";
                    break;
            }
            return {
                amount_positive_new: amount_positive_new,
                amount_negative_new: amount_negative_new,
                amount_total_new: amount_positive_new+amount_negative_new,
                amount_negative: amount_negative,
                amount_positive: amount_positive,
                amount_total: amount_negative+amount_positive,
                status_total: status_total,
                status_new: status_new
            }
        }

        const foods: ReportFoodEntryType[] = [];
        for(let i=0; i<5; i++) {
            let foodRatingValues = getRatingValues(i);

            let labelEntries:  ReportFoodEntryLabelType[] = [];
            for(let j=0; j<foodFeedbackLabels.length; j++) {
                let ratingValues = foodRatingValues

                const label: ReportFoodEntryLabelType = {
                    id: foodFeedbackLabels[j] || "label_alias"+j,
                    alias: foodFeedbackLabels[j] || "label_alias"+j,
                    amount_positive_new: ratingValues.amount_positive_new,
                    amount_negative_new: ratingValues.amount_negative_new,
                    amount_total_new: ratingValues.amount_total_new,
                    amount_total: ratingValues.amount_total,
                    amount_negative: ratingValues.amount_negative,
                    amount_positive: ratingValues.amount_positive,
                    status_total: ratingValues.status_total,
                    status_new: ratingValues.status_new
                };
                labelEntries.push(label);
            }


            const food: ReportFoodEntryType = {
                id: "id",
                alias: foodNames[i],
                image_url: "image_url",
                rating_average: 5 * (foodRatingValues.amount_positive / foodRatingValues.amount_total),
                rating_amount: foodRatingValues.amount_total,
                comments: foodComments,
                comments_new: i%2==0 ? foodComments : [],
                labels: labelEntries,
                status_rating: "status_rating"
            };
            foods.push(food);
        }

        let canteen_feedbacks:  ReportCanteenEntryType[] = [];
        for(let i=0; i<canteenNames.length; i++) {
            const canteenLabel: ReportCanteenEntryType = {
                id: canteenNames[i] || "id+"+i,
                canteen_alias: canteenNames[i] || "canteen_alias+"+i,
                labels: []
            };
            for(let j=0; j<canteenFeedbackLabels.length; j++) {
                let ratingValues = getRatingValues(j);

                const label: ReportCanteenEntryLabelsType = {
                    label_alias: canteenFeedbackLabels[j] || "label_alias"+j,
                    amount_positive_new: ratingValues.amount_positive_new,
                    amount_negative_new: ratingValues.amount_negative_new,
                    amount_total_new: ratingValues.amount_total_new,
                    amount_total: ratingValues.amount_total,
                    amount_negative: ratingValues.amount_negative,
                    amount_positive: ratingValues.amount_positive,
                    status_total: ratingValues.status_total,
                    status_new: ratingValues.status_new
                };
                canteenLabel.labels.push(label);
            }
            canteen_feedbacks.push(canteenLabel);
        }

        function calculateRatingAverage(foods: ReportFoodEntryType[]){
            let ratingSum = 0;
            let ratingCount = 0;
            foods.forEach(food => {
                if(food.rating_average){
                    ratingSum += food.rating_average;
                }
                ratingCount += 1;
            });
            return ratingSum / ratingCount;
        }

        const food_rating_average = calculateRatingAverage(foods);
        const foodAverageRatingThresholds = ReportGenerator.getFoodRatingBadAndGoodThresholds(food_rating_average);

        let report: ReportType = {
            canteen_alias: canteenNames.join(", "),
            dateHumanReadable: "01.01.2024",
            show_images: true,
            show_food_comments_for_all_time: true,
            show_food_comments_for_selected_period: true,
            show_food_feedback_labels_for_all_time: true,
            show_food_feedback_labels_for_selected_period: true,
            show_canteen_feedbacks_for_all_time: true,
            show_canteen_feedbacks_for_selected_period: true,
            food_rating_average: food_rating_average,
            food_rating_threshold_bad: foodAverageRatingThresholds.threshold_bad,
            food_rating_threshold_good: foodAverageRatingThresholds.threshold_good,
            foods: foods,
            canteen_feedbacks: canteen_feedbacks,
            icon_thumbs_up: EmojiHelper.getEmojiDivHTML(EmojiHelper.EmojiFileNames.THUMBS_UP, EmojiHelper.DivTextSize.MEDIUM),
            icon_thumbs_down: EmojiHelper.getEmojiDivHTML(EmojiHelper.EmojiFileNames.THUMBS_DOWN, EmojiHelper.DivTextSize.MEDIUM),
            icon_comment: EmojiHelper.getEmojiDivHTML(EmojiHelper.EmojiFileNames.SPEECH_BUBBLE, EmojiHelper.DivTextSize.SMALL),
            icon_traffic_light_red: ReportStatusTrafficLightValues.RED,
            icon_traffic_light_yellow: ReportStatusTrafficLightValues.YELLOW,
            icon_traffic_light_green: ReportStatusTrafficLightValues.GREEN,
            icon_star: EmojiHelper.getEmojiDivHTML(EmojiHelper.EmojiFileNames.STAR, EmojiHelper.DivTextSize.SMALL)
        }

        let exampleMarkdown = `
# Feedback Report

## Mensen

Hier ist der Feedback Report für die Mensen. Text style *italic* und **bold**.
        `

        let hmtl = await MailHelper.renderMailToHtml({
            template_data: report,
            markdown_content: exampleMarkdown,
            template_name: HtmlTemplatesEnum.CANTEEN_FOOD_FEEDBACK_REPORT
        }, new MyDatabaseTestableHelper());

        let savePath = TestArtifacts.saveTestArtifact(hmtl, "food-feedback-report/example.html");

        expect(true).toBe(true);
    });


});