"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GenerationSettings, TutorialType } from "@/lib/types";

interface SettingsPopoverProps {
  settings: GenerationSettings;
  onSettingsChange: (settings: GenerationSettings) => void;
}

export function SettingsPopover({
  settings,
  onSettingsChange,
}: SettingsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Maximum Pages to Crawl: {settings.maxPages}</Label>
            <Slider
              value={[settings.maxPages]}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, maxPages: value[0] })
              }
              min={1}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Tutorial Focus</Label>
            <RadioGroup
              value={settings.tutorialType}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  tutorialType: value as TutorialType,
                })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balanced" id="balanced" />
                <Label htmlFor="balanced" className="font-normal">
                  Balanced
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="practical" id="practical" />
                <Label htmlFor="practical" className="font-normal">
                  Practical Focus
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conceptual" id="conceptual" />
                <Label htmlFor="conceptual" className="font-normal">
                  Conceptual Focus
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
