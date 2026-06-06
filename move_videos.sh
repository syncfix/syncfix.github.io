#!/bin/bash

SCENES=(
  "f0012be5a74d6ec0fafc655ece3897d086d2d30cce4b5dafe885dd194f9e1e1c"
  "e0a5470d1f203b42e58ef6513deefbc52f9720680080c448f6d29e162c9b7378"
  "eba3bdcb9304819a1cb05d385378a5a3703caceaf5fd6b4e28401659c761db61"
  "f102f93ee1b7304a9a99330b98a49229cf6111da9e764620ae96fae0622040fa"
)

SRC_BASE="/cis/net/io107/data/dli90/pairs_new/eval"
DST_BASE="/cis/home/ayadav/Downloads/syncfix_demo_website/video"

for SCENE_NAME in "${SCENES[@]}"; do
    SRC_DIR_RUN002="${SRC_BASE}/${SCENE_NAME}/K_10/run_002/it_03000"
    SRC_DIR_RUN001="${SRC_BASE}/${SCENE_NAME}/K_10/run_002/it_03000"

    DST_DIR="${DST_BASE}/${SCENE_NAME}/K_12/run_002/it_03000"
    mkdir -p "$DST_DIR"

    VIDEO_1="${SRC_DIR_RUN002}/lbm_output_25views_deflicker/lbm_output_25views_deflicker.mp4"
    VIDEO_2="${SRC_DIR_RUN001}/interpolated_test_trajectory.mp4"

    echo "Processing scene: $SCENE_NAME"

    if [ -f "$VIDEO_1" ]; then
        cp "$VIDEO_1" "$DST_DIR/"
        echo "  Copied: lbm_output_25views_deflicker.mp4"
    else
        echo "  Missing: $VIDEO_1"
    fi

    if [ -f "$VIDEO_2" ]; then
        cp "$VIDEO_2" "$DST_DIR/"
        echo "  Copied: interpolated_test_trajectory.mp4"
    else
        echo "  Missing: $VIDEO_2"
    fi

    echo ""
done
