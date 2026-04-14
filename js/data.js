const videoData = {
    egodex: [
        "assemble_disassemble_furniture_bench_chair_57_0_80.mp4",
        "assemble_disassemble_furniture_bench_desk_49_0_85.mp4",
        "assemble_disassemble_legos_33_0_120.mp4",
        "basic_fold_50_0_120.mp4",
        "basic_pick_place_178_0_73.mp4",
        "boil_serve_egg_2_121_241.mp4",
        "build_unstack_lego_10_0_120.mp4",
        "clean_surface_35_0_120.mp4",
        "declutter_desk_8_0_120.mp4",
        "flip_pages_8_0_120.mp4",
        "fold_stack_unstack_unfold_cloths_2_121_241.mp4",
        "insert_remove_bagging_9_0_83.mp4",
        "insert_remove_bookshelf_18_0_120.mp4",
        "measure_objects_7_121_241.mp4",
        "scoop_dump_ice_35_0_113.mp4",
        "screw_unscrew_allen_fixture_0_0_120.mp4"
    ],
    egovid: [
        "06b63fd8-bf70-434d-962d-d9c20982a7f1_20157_20277.mp4",
        "0f0dde23-36e9-4470-ba96-b85a39e45ed9_20749_20869.mp4",
        "1c5dbe17-32ed-4cb3-b657-da5eb15689ac_22155_22275.mp4",
        "2a2ff7db-5460-4296-a8a7-946ba628226d_39465_39585.mp4",
        "2fa81cfe-e0d4-42e5-be39-e14287215bd2_16763_16883.mp4",
        "6639f53c-701d-4fe7-adcd-55d040ce8afe_17345_17465.mp4",
        "68cd3c17-bdb9-42c6-9a9a-fa7090b3e37e_16371_16491.mp4",
        "6ce93897-2db9-4dca-bc44-2c46fa3a1b39_23262_23382.mp4",
        "94d5eff8-0fac-4719-adf2-5c0208ab89f7_89284_89404.mp4",
        "ae9cb412-7b93-49ae-bb46-306dc74d5fe3_18079_18199.mp4"
    ],

    egocap: [
        "task10_rollout_clip_1_0.5_4.5.mp4",
        "task11_rollout_clip_1_0.5_4.5.mp4",
        "task12_rollout_clip_1_0.5_4.5.mp4",
        "task19_rollout_clip_1_0.5_4.5.mp4",
        "task20_rollout_clip_1_0.5_4.5.mp4",
        "task2_rollout_clip_1_0.5_4.5.mp4",
        "task3_rollout9_clip_1_0.5_4.5.mp4",
        "task5_rollout_clip_1_0.5_4.5.mp4",
        "task6_rollout_clip_1_0.5_4.5.mp4"
    ],
    agibot: [
        "358-683347-001.mp4",
        "362-659751-011.mp4",
        "362-670844-001.mp4",
        "362-721457-007.mp4",
        "362-721510-002.mp4",
        "365-695860-002.mp4",
        "366-657553-001.mp4",
        "414-709170-008.mp4",
        "421-692472-006.mp4",
        "422-727187-012.mp4",
        "422-729968-001.mp4",
        "422-733433-010.mp4",
        "422-735303-000.mp4",
        "475-762473-010.mp4"
    ]
};

const egovidLabels = {
    "06b63fd8-bf70-434d-962d-d9c20982a7f1_20157_20277": "Starting a Cross-Stitch",
    "0f0dde23-36e9-4470-ba96-b85a39e45ed9_20749_20869": "Lifting and Cutting a Flooring Plank",
    "1c5dbe17-32ed-4cb3-b657-da5eb15689ac_22155_22275": "Crochet the Yarn with the Hook",
    "2a2ff7db-5460-4296-a8a7-946ba628226d_39465_39585": "Knead the Dough in the Bowl",
    "2fa81cfe-e0d4-42e5-be39-e14287215bd2_16763_16883": "Inspect the Knife",
    "6639f53c-701d-4fe7-adcd-55d040ce8afe_17345_17465": "Chop the Carrots",
    "68cd3c17-bdb9-42c6-9a9a-fa7090b3e37e_16371_16491": "Assemble the Outdoor Structure",
    "6ce93897-2db9-4dca-bc44-2c46fa3a1b39_23262_23382": "Paint with Watercolors",
    "94d5eff8-0fac-4719-adf2-5c0208ab89f7_89284_89404": "Stir the Soup with a Ladle",
    "ae9cb412-7b93-49ae-bb46-306dc74d5fe3_18079_18199": "Set the Cup Aside"
};

const agibotLabels = {
    "358-683347-001": "Put the Bread into the Toaster",
    "362-659751-011": "Fold the Clothes",
    "362-670844-001": "Fold the Clothes",
    "362-721457-007": "Fold the Clothes",
    "362-721510-002": "Fold the Clothes",
    "365-695860-002": "Take the Bottle out of the Bin",
    "366-657553-001": "Take the Bag out of the Bin",
    "414-709170-008": "Remove the Clothes from the Hanger",
    "421-692472-006": "Wipe the Table",
    "422-727187-012": "Organize the Box",
    "422-729968-001": "Pack the Bubble Wrap into the Box",
    "422-733433-010": "Pack the Bubble Wrap into the Box",
    "422-735303-000": "Pack the Bubble Wrap into the Box",
    "475-762473-010": "Iron the Clothes"
};

const egocapLabels = {
    "task10_rollout_clip_1_0.5_4.5": "Pick up and Inspect the Vegetables",
    "task11_rollout_clip_1_0.5_4.5": "Put the Tofu into the Basket",
    "task12_rollout_clip_1_0.5_4.5": "Put the Tofu into the Basket",
    "task19_rollout_clip_1_0.5_4.5": "Place the Bottle into the Basket",
    "task20_rollout_clip_1_0.5_4.5": "Take the Bottle out of the Basket",
    "task2_rollout_clip_1_0.5_4.5": "Arrange the Snacks on the Shelf",
    "task3_rollout9_clip_1_0.5_4.5": "Arrange the Snacks on the Shelf",
    "task5_rollout_clip_1_0.5_4.5": "Arrange the Drinks on the Shelf",
    "task6_rollout_clip_1_0.5_4.5": "Arrange the Drinks on the Shelf"
};
